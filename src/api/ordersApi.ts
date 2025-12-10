import {
	keepPreviousData,
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import type {
	FetchOrdersParams,
	OrderStatus,
	OrdersListResponse,
} from "@/types/orders";
import { api } from "./axios";

type FetchStatsParams = {
	startDate: string;
	endDate: string;
	limit?: string;
};

export const ordersApi = {
	fetchOrders: async (
		fetchOrderParams: FetchOrdersParams = {},
	): Promise<OrdersListResponse> => {
		const res = await api.get("/orders", { params: fetchOrderParams });
		return res.data;
	},
	updateOrderStatus: async ({
		orderId,
		orderStatus,
	}: {
		orderId: string;
		orderStatus: OrderStatus;
	}) => {
		const res = await api.patch(`/orders/${orderId}/status`, { orderStatus });
		return res.data;
	},
	fetchStats: async ({ startDate, endDate, limit }: FetchStatsParams) => {
		const res = await api.get("/orders/stats/summary", {
			params: { startDate, endDate, limit },
		});
		return res.data;
	},
	fetchMonthlySales: async (monthsCount = 6) => {
		const res = await api.get("/orders/stats/monthly-sales", {
			params: { monthsCount },
		});
		return res.data;
	},
};

export const fetchOrdersQueryOptions = (fetchOrderParams?: FetchOrdersParams) =>
	queryOptions({
		queryKey: ["orders", fetchOrderParams ?? {}],
		queryFn: () => ordersApi.fetchOrders(fetchOrderParams),
		staleTime: Number.POSITIVE_INFINITY,
		placeholderData: keepPreviousData,
	});

export const fetchStatsQueryOptions = ({
	startDate,
	endDate,
	limit,
}: FetchStatsParams) =>
	queryOptions({
		queryKey: ["stats", startDate, endDate, limit],
		queryFn: () => ordersApi.fetchStats({ startDate, endDate, limit }),
		staleTime: Number.POSITIVE_INFINITY,
	});

export const fetchMonthlySalesQueryOptions = (months = 6) =>
	queryOptions({
		queryKey: ["monthly-sales", months],
		queryFn: () => ordersApi.fetchMonthlySales(months),
		staleTime: Number.POSITIVE_INFINITY,
	});

export function useUpdateOrderStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ordersApi.updateOrderStatus,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
			queryClient.invalidateQueries({ queryKey: ["stats"] });
		},
		onError: (error: AxiosError<any>) => {
			const message = error.response?.data?.message ?? "Something went wrong";
			toast.error(message);
		},
	});
}
