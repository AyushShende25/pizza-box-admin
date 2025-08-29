import { queryOptions } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { SizeFormType } from "@/components/SizeForm";
import type { Size } from "@/types/size";

export const sizesApi = {
	fetchAllSizes: async (): Promise<Size[]> => {
		const res = await api.get("/menu/sizes");
		return res.data;
	},
	createSize: async (sizeFormData: SizeFormType): Promise<Size> => {
		const { displayName, sortOrder, ...rest } = sizeFormData;
		const res = await api.post("/menu/sizes", {
			...rest,
			display_name: displayName,
			sort_order: sortOrder,
		});
		return res.data;
	},
	updateSize: async (sizeId: string, sizeUpdateData: SizeFormType) => {
		const { displayName, sortOrder, ...rest } = sizeUpdateData;
		const res = await api.patch(`/menu/sizes/${sizeId}`, {
			...rest,
			display_name: displayName,
			sort_order: sortOrder,
		});
		return res.data;
	},
	deleteSize: async (sizeId: string) => {
		await api.delete(`/menu/sizes/${sizeId}`);
	},
	toggleAvailability: async (sizeId: string, isAvailable: boolean) => {
		const res = await api.patch(`/menu/sizes/${sizeId}`, {
			is_available: isAvailable,
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
