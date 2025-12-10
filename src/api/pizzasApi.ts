import {
	keepPreviousData,
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api/axios";
import type { PizzaFormType } from "@/components/PizzaForm";
import type { FetchPizzaParams, Pizza, PizzaListResponse } from "@/types/pizza";

export const pizzasApi = {
	fetchAllPizzas: async (
		fetchPizzaParams: FetchPizzaParams = {},
	): Promise<PizzaListResponse> => {
		const res = await api.get("/menu/pizzas", {
			params: fetchPizzaParams,
		});
		return res.data;
	},
	createPizza: async (
		pizzaFormData: PizzaFormType,
		imgUrl?: string,
	): Promise<Pizza> => {
		const { pizzaImage: _, defaultToppings, ...rest } = pizzaFormData;
		const res = await api.post("/menu/pizzas", {
			...rest,
			default_topping_ids: defaultToppings?.map((t) => t.id),
			imgUrl,
		});
		return res.data;
	},
	updatePizza: async (
		pizzaId: string,
		pizzaUpdateData: PizzaFormType,
		imgUrl?: string,
	) => {
		const { pizzaImage: _, defaultToppings, ...rest } = pizzaUpdateData;
		const res = await api.patch(`/menu/pizzas/${pizzaId}`, {
			...rest,
			default_topping_ids: defaultToppings?.map((t) => t.id),
			imgUrl,
		});
		return res.data;
	},
	deletePizza: async (pizzaId: string) => {
		await api.delete(`/menu/pizzas/${pizzaId}`);
	},
	toggleAvailability: async (pizzaId: string, isAvailable: boolean) => {
		const res = await api.patch(`/menu/pizzas/${pizzaId}`, {
			isAvailable,
		});
		return res.data;
	},
	toggleIsFeatured: async (pizzaId: string, isFeatured: boolean) => {
		const res = await api.patch(`/menu/pizzas/${pizzaId}`, {
			featured: isFeatured,
		});
		return res.data;
	},
};

export const fetchPizzasQueryOptions = (fetchPizzaParams?: FetchPizzaParams) =>
	queryOptions({
		queryKey: ["pizzas", fetchPizzaParams ?? {}],
		queryFn: () => pizzasApi.fetchAllPizzas(fetchPizzaParams),
		staleTime: Number.POSITIVE_INFINITY,
		placeholderData: keepPreviousData,
	});

export function useCreatePizza() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ data, imgUrl }: { data: PizzaFormType; imgUrl: string }) =>
			pizzasApi.createPizza(data, imgUrl),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["pizzas"],
			});
			toast.success("new pizza added");
		},
	});
}

export function useDeletePizza() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			pizzaId,
		}: {
			pizzaId: string;
			queryParams?: FetchPizzaParams;
			onPageRedirect?: () => void;
		}) => pizzasApi.deletePizza(pizzaId),
		onMutate: async ({ pizzaId, queryParams, onPageRedirect }) => {
			const queryKey = ["pizzas", queryParams ?? {}];
			await queryClient.cancelQueries({ queryKey });

			const previousData =
				queryClient.getQueryData<PizzaListResponse>(queryKey);

			if (previousData) {
				const newItems = previousData.items.filter(
					(pizza) => pizza.id !== pizzaId,
				);
				const currentPage = queryParams?.page ?? 1;

				queryClient.setQueryData<PizzaListResponse>(queryKey, {
					...previousData,
					items: newItems,
				});
				// Handle redirect if last item on non-first page
				if (newItems.length === 0 && currentPage > 1 && onPageRedirect) {
					onPageRedirect();
				}
			}

			return { previousData, queryKey };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousData && context?.queryKey) {
				queryClient.setQueryData(context.queryKey, context.previousData);
			}
		},
		onSettled: (_data, _error, { queryParams }) => {
			queryClient.invalidateQueries({
				queryKey: ["pizzas", queryParams ?? {}],
			});
		},
	});
}

export function useTogglePizzaAvailability() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			pizzaId,
			isAvailable,
		}: {
			pizzaId: string;
			isAvailable: boolean;
			queryParams?: FetchPizzaParams;
		}) => pizzasApi.toggleAvailability(pizzaId, isAvailable),
		onMutate: async ({ pizzaId, isAvailable, queryParams }) => {
			const queryKey = ["pizzas", queryParams ?? {}];
			await queryClient.cancelQueries({ queryKey });

			const previousData =
				queryClient.getQueryData<PizzaListResponse>(queryKey);

			if (previousData) {
				queryClient.setQueryData<PizzaListResponse>(queryKey, {
					...previousData,
					items: previousData.items.map((pizza) =>
						pizza.id === pizzaId ? { ...pizza, isAvailable } : pizza,
					),
				});
			}

			return { previousData, queryKey };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousData && context?.queryKey) {
				queryClient.setQueryData(context.queryKey, context.previousData);
			}
		},
		onSettled: (_data, _err, { queryParams }) => {
			queryClient.invalidateQueries({
				queryKey: ["pizzas", queryParams ?? {}],
			});
		},
	});
}

export function useTogglePizzaFeatured() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			pizzaId,
			isFeatured,
		}: {
			pizzaId: string;
			isFeatured: boolean;
			queryParams?: FetchPizzaParams;
		}) => pizzasApi.toggleIsFeatured(pizzaId, isFeatured),
		onMutate: async ({ pizzaId, isFeatured, queryParams }) => {
			const queryKey = ["pizzas", queryParams ?? {}];
			await queryClient.cancelQueries({ queryKey });

			const previousData =
				queryClient.getQueryData<PizzaListResponse>(queryKey);
			console.log(previousData, "p");

			if (previousData) {
				queryClient.setQueryData<PizzaListResponse>(queryKey, {
					...previousData,
					items: previousData.items.map((pizza) =>
						pizza.id === pizzaId ? { ...pizza, featured: isFeatured } : pizza,
					),
				});
			}

			return { previousData, queryKey };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousData && context?.queryKey) {
				queryClient.setQueryData(context.queryKey, context.previousData);
			}
		},
		onSettled: (_data, _err, { queryParams }) => {
			queryClient.invalidateQueries({
				queryKey: ["pizzas", queryParams ?? {}],
			});
		},
	});
}

export function useUpdatePizza() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			data,
			pizzaId,
			imgUrl,
		}: {
			data: PizzaFormType;
			pizzaId: string;
			imgUrl: string;
		}) => pizzasApi.updatePizza(pizzaId, data, imgUrl),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["pizzas"],
			});
			toast.success("pizza update successful");
		},
	});
}
