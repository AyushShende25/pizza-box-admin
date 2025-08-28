import { queryOptions } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { Pizza } from "@/types/pizza";

export const pizzasApi = {
	fetchAllPizzas: async (): Promise<Pizza[]> => {
		const res = await api.get("/menu/pizzas");
		return res.data;
	},
};

export const fetchPizzasQueryOptions = () =>
	queryOptions({
		queryKey: ["pizzas"],
		queryFn: () => pizzasApi.fetchAllPizzas(),
		staleTime: Number.POSITIVE_INFINITY,
	});
