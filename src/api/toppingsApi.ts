import { queryOptions } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { ToppingFormType } from "@/components/ToppingForm";
import type { Topping, ToppingCategory } from "@/types/toppings";

export const toppingsApi = {
	fetchAllToppings: async (
		toppingCategory?: ToppingCategory,
		vegetarianOnly?: boolean,
	): Promise<Topping[]> => {
		const res = await api.get("/menu/toppings", {
			params: {
				...(toppingCategory && { category: toppingCategory }),
				...(vegetarianOnly !== undefined && { vegetarianOnly }),
			},
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

export const fetchToppingsQueryOptions = () =>
	queryOptions({
		queryKey: ["toppings"],
		queryFn: () => toppingsApi.fetchAllToppings(),
		staleTime: Number.POSITIVE_INFINITY,
	});
