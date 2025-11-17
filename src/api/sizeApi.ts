import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api/axios";
import type { SizeFormType } from "@/components/SizeForm";
import type { Size } from "@/types/size";

export const sizesApi = {
	fetchAllSizes: async (): Promise<Size[]> => {
		const res = await api.get("/menu/sizes");
		return res.data;
	},
	createSize: async (sizeFormData: SizeFormType): Promise<Size> => {
		const res = await api.post("/menu/sizes", sizeFormData);
		return res.data;
	},
	updateSize: async (sizeId: string, sizeUpdateData: SizeFormType) => {
		const res = await api.patch(`/menu/sizes/${sizeId}`, sizeUpdateData);
		return res.data;
	},
	deleteSize: async (sizeId: string) => {
		await api.delete(`/menu/sizes/${sizeId}`);
	},
	toggleAvailability: async (sizeId: string, isAvailable: boolean) => {
		const res = await api.patch(`/menu/sizes/${sizeId}`, {
			isAvailable,
		});
		return res.data;
	},
};

export const fetchSizesQueryOptions = () =>
	queryOptions({
		queryKey: ["sizes"],
		queryFn: () => sizesApi.fetchAllSizes(),
		staleTime: Number.POSITIVE_INFINITY,
	});

export function useCreateSize() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: SizeFormType) => sizesApi.createSize(data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["sizes"],
			});
			toast.success("new size added");
		},
	});
}

export function useDeleteSize() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (sizeId: string) => sizesApi.deleteSize(sizeId),
		onMutate: async (sizeId) => {
			await queryClient.cancelQueries({ queryKey: ["sizes"] });

			const previousSizes = queryClient.getQueryData<Size[]>(["sizes"]);

			queryClient.setQueryData<Size[]>(["sizes"], (old) =>
				old?.filter((i) => i.id !== sizeId),
			);

			return { previousSizes };
		},
		onError: (_err, _variables, context) => {
			queryClient.setQueryData(["sizes"], context?.previousSizes);
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["sizes"],
			});
		},
	});
}

export function useToggleSizeAvailability() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			sizeId,
			isAvailable,
		}: {
			sizeId: string;
			isAvailable: boolean;
		}) => sizesApi.toggleAvailability(sizeId, isAvailable),
		onMutate: async ({ sizeId, isAvailable }) => {
			await queryClient.cancelQueries({ queryKey: ["sizes"] });

			const previousSizes = queryClient.getQueryData<Size[]>(["sizes"]);

			queryClient.setQueryData<Size[]>(["sizes"], (old) =>
				old?.map((i) => (i.id === sizeId ? { ...i, isAvailable } : i)),
			);

			return { previousSizes };
		},
		onError: (_err, _variables, context) => {
			queryClient.setQueryData(["sizes"], context?.previousSizes);
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["sizes"],
			});
		},
	});
}

export function useUpdateSize() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ data, sizeId }: { data: SizeFormType; sizeId: string }) =>
			sizesApi.updateSize(sizeId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["sizes"],
			});
			toast.success("Size update successful");
		},
	});
}
