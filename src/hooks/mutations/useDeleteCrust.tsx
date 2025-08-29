import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crustsApi } from "@/api/crustApi";
import type { Crust } from "@/types/crust";

function useDeleteCrust() {
	const queryClient = useQueryClient();
	const {
		mutate: deleteCrustMutation,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: (crustId: string) => crustsApi.deleteCrust(crustId),
		onMutate: async (crustId) => {
			await queryClient.cancelQueries({ queryKey: ["crusts"] });

			const previousCrusts = queryClient.getQueryData<Crust[]>(["crusts"]);

			queryClient.setQueryData<Crust[]>(["crusts"], (old) =>
				old?.filter((i) => i.id !== crustId),
			);

			return { previousCrusts };
		},
		onError: (_err, _variables, context) => {
			queryClient.setQueryData(["crusts"], context?.previousCrusts);
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["crusts"],
			});
		},
	});
	return { isError, isPending, error, deleteCrustMutation };
}
export default useDeleteCrust;
