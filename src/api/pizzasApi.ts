import { queryOptions } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { PizzaFormType } from "@/components/PizzaForm";
import type { Pizza } from "@/types/pizza";

export const pizzasApi = {
	fetchAllPizzas: async (): Promise<Pizza[]> => {
		const res = await api.get("/menu/pizzas");
		return res.data;
	},
	createPizza: async (
		pizzaFormData: PizzaFormType,
		imgUrl?: string,
	): Promise<Pizza> => {
		const { basePrice, pizzaImage, defaultToppings, ...rest } = pizzaFormData;
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
		const { basePrice, pizzaImage, defaultToppings, ...rest } = pizzaUpdateData;
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
};

export const fetchPizzasQueryOptions = () =>
	queryOptions({
		queryKey: ["pizzas"],
		queryFn: () => pizzasApi.fetchAllPizzas(),
		staleTime: Number.POSITIVE_INFINITY,
	});
