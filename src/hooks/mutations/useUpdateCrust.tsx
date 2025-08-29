import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { crustsApi } from "@/api/crustApi";
import type { CrustFormType } from "@/components/CrustForm";

function useUpdateCrust() {
	const queryClient = useQueryClient();

	const {
		mutateAsync: updateCrustMutation,
		isError,
		isPending,
		error,
	} = useMutation({
		mutationFn: ({ data, crustId }: { data: CrustFormType; crustId: string }) =>
			crustsApi.updateCrust(crustId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["crusts"],
			});
			toast.success("crust update successful");
		},
	});

	return { updateCrustMutation, isPending, isError, error };
}
export default useUpdateCrust;
