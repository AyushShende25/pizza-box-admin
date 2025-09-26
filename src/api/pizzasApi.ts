import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { PizzaFormType } from "@/components/PizzaForm";
import type { FetchPizzaProps, Pizza, PizzaListResponse } from "@/types/pizza";

export const pizzasApi = {
	fetchAllPizzas: async ({
		limit,
		page,
		sortBy,
		category,
		name,
		isAvailable,
	}: FetchPizzaProps = {}): Promise<PizzaListResponse> => {
		const query = new URLSearchParams({
			...(limit && { limit: String(limit) }),
			...(page !== undefined && { page: String(page) }),
			...(sortBy && { sort_by: sortBy }),
			...(category && { category }),
			...(name && { name }),
			...(isAvailable !== undefined && { is_available: String(isAvailable) }),
		});
		const res = await api.get(`/menu/pizzas?${query}`);
		console.log(res.data);
		return res.data;
	},
	createPizza: async (
		pizzaFormData: PizzaFormType,
		imgUrl?: string,
	): Promise<Pizza> => {
		const {
			basePrice,
			pizzaImage: _,
			defaultToppings,
			...rest
		} = pizzaFormData;
		const res = await api.post("/menu/pizzas", {
			...rest,
			base_price: basePrice,
			default_topping_ids: defaultToppings?.map((t) => t.id),
			image_url: imgUrl,
		});
		return res.data;
	},
	updatePizza: async (
		pizzaId: string,
		pizzaUpdateData: PizzaFormType,
		imgUrl?: string,
	) => {
		const {
			basePrice,
			pizzaImage: _,
			defaultToppings,
			...rest
		} = pizzaUpdateData;
		const res = await api.patch(`/menu/pizzas/${pizzaId}`, {
			...rest,
			base_price: basePrice,
			default_topping_ids: defaultToppings?.map((t) => t.id),
			image_url: imgUrl,
		});
		return res.data;
	},
	deletePizza: async (pizzaId: string) => {
		await api.delete(`/menu/pizzas/${pizzaId}`);
	},
	toggleAvailability: async (pizzaId: string, isAvailable: boolean) => {
		const res = await api.patch(`/menu/pizzas/${pizzaId}`, {
			is_available: isAvailable,
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

export const fetchPizzasQueryOptions = (fetchPizzaProps?: FetchPizzaProps) =>
	queryOptions({
		queryKey: ["pizzas", fetchPizzaProps ?? {}],
		queryFn: () => pizzasApi.fetchAllPizzas(fetchPizzaProps),
		staleTime: Number.POSITIVE_INFINITY,
		placeholderData: keepPreviousData,
	});
