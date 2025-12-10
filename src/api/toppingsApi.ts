import {
	keepPreviousData,
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api/axios";
import type { ToppingFormType } from "@/components/ToppingForm";
import type { FetchToppingsParams, Topping } from "@/types/toppings";

export const toppingsApi = {
	fetchAllToppings: async (
		fetchToppingsParams: FetchToppingsParams = {},
	): Promise<Topping[]> => {
		const res = await api.get("/menu/toppings", {
			params: fetchToppingsParams,
		});
		return res.data;
	},
	createTopping: async (
		toppingFormInput: ToppingFormType,
		imgUrl?: string,
	): Promise<Topping> => {
		const { type, toppingImage: _, ...rest } = toppingFormInput;
		const isVegetarian = type === "veg";
		const res = await api.post("/menu/toppings", {
			...rest,
			isVegetarian,
			imgUrl,
		});
		return res.data;
	},
	updateTopping: async (
		toppingId: string,
		toppingUpdateData: ToppingFormType,
		imgUrl?: string,
	) => {
		const { type, toppingImage: _, ...rest } = toppingUpdateData;
		const isVegetarian = type === "veg";
		const res = await api.patch(`/menu/toppings/${toppingId}`, {
			...rest,
			isVegetarian,
			imgUrl,
		});
		return res.data;
	},
	deleteTopping: async (toppingId: string) => {
		await api.delete(`/menu/toppings/${toppingId}`);
	},
	toggleAvailability: async (toppingId: string, isAvailable: boolean) => {
		const res = await api.patch(`/menu/toppings/${toppingId}`, {
			isAvailable,
		});
		return res.data;
	},
};

export const fetchToppingsQueryOptions = (
	fetchToppingsParams?: FetchToppingsParams,
) =>
	queryOptions({
		queryKey: ["toppings", fetchToppingsParams ?? {}],
		queryFn: () => toppingsApi.fetchAllToppings(fetchToppingsParams),
		staleTime: Number.POSITIVE_INFINITY,
		placeholderData: keepPreviousData,
	});

export function useCreateTopping() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ data, imgUrl }: { data: ToppingFormType; imgUrl: string }) =>
			toppingsApi.createTopping(data, imgUrl),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["toppings"],
			});
			toast.success("new topping added");
		},
	});
}

export function useDeleteTopping() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			toppingId,
		}: {
			toppingId: string;
			queryParams?: FetchToppingsParams;
		}) => toppingsApi.deleteTopping(toppingId),
		onMutate: async ({ toppingId, queryParams }) => {
			const queryKey = ["toppings", queryParams ?? {}];
			await queryClient.cancelQueries({ queryKey });

			const previousToppings = queryClient.getQueryData<Topping[]>([
				"toppings",
			]);

			queryClient.setQueryData<Topping[]>(queryKey, (old) =>
				old?.filter((i) => i.id !== toppingId),
			);

			return { previousToppings, queryKey };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousToppings && context?.queryKey) {
				queryClient.setQueryData(context.queryKey, context.previousToppings);
			}
		},
		onSettled: (_data, _err, { queryParams }) => {
			queryClient.invalidateQueries({
				queryKey: ["toppings", queryParams ?? {}],
			});
		},
	});
}

export function useToggleToppingAvailability() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			toppingId,
			isAvailable,
		}: {
			toppingId: string;
			isAvailable: boolean;
			queryParams?: FetchToppingsParams;
		}) => toppingsApi.toggleAvailability(toppingId, isAvailable),
		onMutate: async ({ toppingId, isAvailable, queryParams }) => {
			const queryKey = ["toppings", queryParams ?? {}];
			await queryClient.cancelQueries({ queryKey });

			const previousToppings = queryClient.getQueryData<Topping[]>(queryKey);

			if (previousToppings) {
				queryClient.setQueryData<Topping[]>(
					queryKey,
					previousToppings.map((i) =>
						i.id === toppingId ? { ...i, isAvailable } : i,
					),
				);
			}

			return { previousToppings, queryKey };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousToppings && context?.queryKey) {
				queryClient.setQueryData(context.queryKey, context.previousToppings);
			}
		},
		onSettled: (_data, _err, { queryParams }) => {
			queryClient.invalidateQueries({
				queryKey: ["toppings", queryParams ?? {}],
			});
		},
	});
}

export function useUpdateTopping() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			data,
			toppingId,
			imgUrl,
		}: {
			data: ToppingFormType;
			toppingId: string;
			imgUrl: string;
		}) => toppingsApi.updateTopping(toppingId, data, imgUrl),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["toppings"],
			});
			toast.success("topping update successful");
		},
	});
}
