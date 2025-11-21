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
		console.log(res.data, "update-status");

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

export function useUpdateOrderStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ordersApi.updateOrderStatus,
		onSuccess: () => {
			toast.success("updated order-status");
			queryClient.invalidateQueries({
				queryKey: ["orders"],
			});
		},
		onError: (error: AxiosError<any>) => {
			const message = error.response?.data?.message ?? "Something went wrong";
			toast.error(message);
		},
	});
}
