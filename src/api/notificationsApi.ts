import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import type { Notification } from "@/types/notifications";
import { api } from "./axios";

export const notificationsApi = {
	fetchNotifications: async (): Promise<Notification[]> => {
		const res = await api.get("/notifications", {
			params: {
				limit: 10,
			},
		});
		return res.data;
	},
	markAsRead: async (notificationIds: string[]) => {
		const res = await api.post("/notifications/mark-read", { notificationIds });
		return res.data;
	},
};

export const fetchNotificationsQueryOptions = () =>
	queryOptions({
		queryKey: ["notifications"],
		queryFn: notificationsApi.fetchNotifications,
		staleTime: Number.POSITIVE_INFINITY,
	});

export function useMarkAsRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: notificationsApi.markAsRead,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error: AxiosError<any>) => {
			const message = error.response?.data?.message ?? "Something went wrong";
			toast.error(message);
		},
	});
}
