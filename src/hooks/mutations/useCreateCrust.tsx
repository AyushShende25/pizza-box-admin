import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { crustsApi } from "@/api/crustApi";
import type { CrustFormType } from "@/components/CrustForm";

function useCreateCrust() {
	const queryClient = useQueryClient();

	const {
		mutateAsync: createCrustMutation,
		isError,
		isPending,
		error,
	} = useMutation({
		mutationFn: (data: CrustFormType) => crustsApi.createCrust(data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["crusts"],
			});
			toast.success("new crust added");
		},
	});

	return { createCrustMutation, isPending, isError, error };
}
export default useCreateCrust;
