import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api/axios";
import type { CrustFormType } from "@/components/CrustForm";
import type { Crust } from "@/types/crust";

export const crustsApi = {
	fetchAllCrusts: async (): Promise<Crust[]> => {
		const res = await api.get("/menu/crusts");
		return res.data;
	},
	createCrust: async (crustFormData: CrustFormType): Promise<Crust> => {
		const { price, ...rest } = crustFormData;
		const res = await api.post("/menu/crusts", {
			...rest,
			additionalPrice: price,
		});
		return res.data;
	},
	updateCrust: async (crustId: string, crustUpdateData: CrustFormType) => {
		const { price, ...rest } = crustUpdateData;

		const res = await api.patch(`/menu/crusts/${crustId}`, {
			...rest,
			additionalPrice: price,
		});
		return res.data;
	},
	deleteCrust: async (crustId: string) => {
		await api.delete(`/menu/crusts/${crustId}`);
	},
	toggleAvailability: async (crustId: string, isAvailable: boolean) => {
		const res = await api.patch(`/menu/crusts/${crustId}`, {
			isAvailable,
		});
		return res.data;
	},
};

export const fetchCrustsQueryOptions = () =>
	queryOptions({
		queryKey: ["crusts"],
		queryFn: () => crustsApi.fetchAllCrusts(),
		staleTime: Number.POSITIVE_INFINITY,
	});

export function useCreateCrust() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CrustFormType) => crustsApi.createCrust(data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["crusts"],
			});
			toast.success("new crust added");
		},
	});
}

export function useDeleteCrust() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (crustId: string) => crustsApi.deleteCrust(crustId),
		onMutate: async (crustId) => {
			await queryClient.cancelQueries({ queryKey: ["crusts"] });

			const previousCrusts = queryClient.getQueryData<Crust[]>(["crusts"]);

			queryClient.setQueryData<Crust[]>(["crusts"], (old) =>
				old?.filter((i) => i.id !== crustId),
			);

			return { previousCrusts };
		},
		onError: (_err, _variables, context) => {
			queryClient.setQueryData(["crusts"], context?.previousCrusts);
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["crusts"],
			});
		},
	});
}

export function useToggleCrustAvailability() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			crustId,
			isAvailable,
		}: {
			crustId: string;
			isAvailable: boolean;
		}) => crustsApi.toggleAvailability(crustId, isAvailable),
		onMutate: async ({ crustId, isAvailable }) => {
			await queryClient.cancelQueries({ queryKey: ["crusts"] });

			const previousCrusts = queryClient.getQueryData<Crust[]>(["crusts"]);

			queryClient.setQueryData<Crust[]>(["crusts"], (old) =>
				old?.map((i) => (i.id === crustId ? { ...i, isAvailable } : i)),
			);

			return { previousCrusts };
		},
		onError: (_err, _variables, context) => {
			queryClient.setQueryData(["crusts"], context?.previousCrusts);
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["crusts"],
			});
		},
	});
}

export function useUpdateCrust() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ data, crustId }: { data: CrustFormType; crustId: string }) =>
			crustsApi.updateCrust(crustId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["crusts"],
			});
			toast.success("crust update successful");
		},
	});
}
