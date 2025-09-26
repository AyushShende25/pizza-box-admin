import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authApi, fetchCurrentUserOptions } from "@/api/authApi";
import type { LoginFormType } from "@/components/LoginForm";

function useLogin() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const {
		mutateAsync: loginMutation,
		isError,
		isPending,
		error,
	} = useMutation({
		mutationFn: (data: LoginFormType) => authApi.login(data),
		onSuccess: async () => {
			await queryClient.cancelQueries({ queryKey: ["me"] });
			queryClient.removeQueries({ queryKey: ["me"], exact: true });

			const user = await queryClient.fetchQuery(fetchCurrentUserOptions());
			queryClient.setQueryData(["me"], user);

			navigate({ to: "/", replace: true });
		},
	});
	return { loginMutation, isError, isPending, error };
}
export default useLogin;
