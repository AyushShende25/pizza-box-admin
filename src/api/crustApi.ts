import { queryOptions } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { CrustFormType } from "@/components/CrustForm";
import type { Crust } from "@/types/crust";

export const crustsApi = {
	fetchAllCrusts: async (): Promise<Crust[]> => {
		const res = await api.get("/menu/crusts");
		return res.data;
	},
	createCrust: async (crustFormData: CrustFormType): Promise<Crust> => {
		const { price, sortOrder, ...rest } = crustFormData;
		const res = await api.post("/menu/crusts", {
			...rest,
			additional_price: price,
			sort_order: sortOrder,
		});
		return res.data;
	},
	updateCrust: async (crustId: string, crustUpdateData: CrustFormType) => {
		const { price, sortOrder, ...rest } = crustUpdateData;

		const res = await api.patch(`/menu/crusts/${crustId}`, {
			...rest,
			additional_price: price,
			sort_order: sortOrder,
		});
		return res.data;
	},
	deleteCrust: async (crustId: string) => {
		await api.delete(`/menu/crusts/${crustId}`);
	},
	toggleAvailability: async (crustId: string, isAvailable: boolean) => {
		const res = await api.patch(`/menu/crusts/${crustId}`, {
			is_available: isAvailable,
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
