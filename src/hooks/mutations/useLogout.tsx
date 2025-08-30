import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { authApi } from "@/api/authApi";

function useLogout() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { mutate: logoutMutation } = useMutation({
		mutationFn: authApi.logout,
		onSettled: () => {
			queryClient.clear();
			navigate({ to: "/login" });
		},
	});
	return { logoutMutation };
}

export default useLogout;
