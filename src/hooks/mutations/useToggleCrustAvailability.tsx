import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crustsApi } from "@/api/crustApi";
import type { Crust } from "@/types/crust";

function useToggleCrustAvailability() {
	const queryClient = useQueryClient();
	const {
		mutate: toggleCrustAvailabilityMutation,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: ({
			crustId,
			isAvailable,
		}: {
			crustId: string;
			isAvailable: boolean;
		}) => crustsApi.toggleAvailability(crustId, isAvailable),
		onMutate: async ({ crustId, isAvailable }) => {
			await queryClient.cancelQueries({ queryKey: ["crusts"] });

			const previousCrusts = queryClient.getQueryData<Crust[]>(["crusts"]);

			queryClient.setQueryData<Crust[]>(["crusts"], (old) =>
				old?.map((i) =>
					i.id === crustId ? { ...i, is_available: isAvailable } : i,
				),
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
	return { toggleCrustAvailabilityMutation, isPending, isError, error };
}
export default useToggleCrustAvailability;
