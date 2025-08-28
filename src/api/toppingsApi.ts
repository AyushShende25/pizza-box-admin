import { queryOptions } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { ToppingFormType } from "@/components/ToppingForm";
import type { Topping, ToppingCategory } from "@/types/toppings";

export const toppingsApi = {
	fetchAllToppings: async (
		toppingCategory?: ToppingCategory,
		vegetarian_only?: boolean,
	): Promise<Topping[]> => {
		const res = await api.get("/menu/toppings", {
			params: {
				...(toppingCategory && { category: toppingCategory }),
				...(vegetarian_only !== undefined && { vegetarian_only }),
			},
		});
		return res.data;
	},
	createTopping: async (
		toppingFormInput: ToppingFormType,
		imgUrl?: string,
	): Promise<Topping> => {
		// biome-ignore lint/correctness/noUnusedVariables: <we don't need to send image to the backend only img-url>
		const { type, toppingImage, ...rest } = toppingFormInput;
		const is_vegetarian = type === "veg";
		const res = await api.post("/menu/toppings", {
			...rest,
			is_vegetarian,
			image_url: imgUrl,
		});
		return res.data;
	},
	updateTopping: async (
		toppingId: string,
		toppingUpdateData: ToppingFormType,
		imgUrl?: string,
	) => {
		// biome-ignore lint/correctness/noUnusedVariables: <we don't need to send image to the backend only img-url>
		const { type, toppingImage, ...rest } = toppingUpdateData;
		const is_vegetarian = type === "veg";
		const res = await api.patch(`/menu/toppings/${toppingId}`, {
			...rest,
			is_vegetarian,
			image_url: imgUrl,
		});
		return res.data;
	},
	deleteTopping: async (toppingId: string) => {
		await api.delete(`/menu/toppings/${toppingId}`);
	},
	toggleAvailability: async (toppingId: string, isAvailable: boolean) => {
		const res = await api.patch(`/menu/toppings/${toppingId}`, {
			is_available: isAvailable,
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
