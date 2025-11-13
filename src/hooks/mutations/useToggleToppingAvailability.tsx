import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toppingsApi } from "@/api/toppingsApi";
import type { Topping } from "@/types/toppings";

function useToggleToppingAvailability() {
	const queryClient = useQueryClient();
	const {
		mutate: toggleToppingAvailabilityMutation,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: ({
			toppingId,
			isAvailable,
		}: {
			toppingId: string;
			isAvailable: boolean;
		}) => toppingsApi.toggleAvailability(toppingId, isAvailable),
		onMutate: async ({ toppingId, isAvailable }) => {
			await queryClient.cancelQueries({ queryKey: ["toppings"] });

			const previousToppings = queryClient.getQueryData<Topping[]>([
				"toppings",
			]);

			queryClient.setQueryData<Topping[]>(["toppings"], (old) =>
				old?.map((i) => (i.id === toppingId ? { ...i, isAvailable } : i)),
			);

			return { previousToppings };
		},
		onError: (_err, _variables, context) => {
			queryClient.setQueryData(["toppings"], context?.previousToppings);
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["toppings"],
			});
		},
	});
	return { toggleToppingAvailabilityMutation, isPending, isError, error };
}
export default useToggleToppingAvailability;
