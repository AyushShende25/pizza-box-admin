import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@/api/axios";
import type { LoginFormType } from "@/components/LoginForm";
import type { User } from "@/types/user";

export const authApi = {
	login: async (loginData: LoginFormType) => {
		const res = await api.post("/auth/login", loginData);
		return res.data;
	},
	getMe: async (): Promise<User | null> => {
		try {
			const res = await api.get("/auth/me");
			return res.data;
		} catch (error) {
			console.log(error);
			return null;
		}
	},
	refresh: async () => {
		const res = await api.post("/auth/refresh");
		return res.data;
	},
	logout: async () => {
		const res = await api.post("/auth/logout");
		return res.data;
	},
};

export const fetchCurrentUserOptions = () =>
	queryOptions({
		queryKey: ["me"],
		queryFn: authApi.getMe,
		staleTime: Number.POSITIVE_INFINITY,
		retry: false,
	});

api.interceptors.response.use(
	function onFulfilled(response) {
		return response;
	},
	async function onRejected(error) {
		const originalRequest = error.config;
		const errCode = error?.response?.data?.error;
		if (
			error.status === 401 &&
			errCode === "MISSING_TOKEN" &&
			!originalRequest._retry
		) {
			originalRequest._retry = true;
			await authApi.refresh();
			return api(originalRequest);
		}
		return Promise.reject(error);
	},
);

export function useLogin() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	return useMutation({
		mutationFn: (data: LoginFormType) => authApi.login(data),
		onSuccess: async () => {
			await queryClient.cancelQueries({ queryKey: ["me"] });
			queryClient.removeQueries({ queryKey: ["me"], exact: true });

			const user = await queryClient.fetchQuery(fetchCurrentUserOptions());
			queryClient.setQueryData(["me"], user);

			navigate({ to: "/", replace: true });
		},
	});
}

export function useLogout() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: authApi.logout,
		onSettled: () => {
			queryClient.clear();
			navigate({ to: "/login" });
		},
	});
}
