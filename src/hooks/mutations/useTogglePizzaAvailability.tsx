import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pizzasApi } from "@/api/pizzasApi";
import type { Pizza } from "@/types/pizza";

function useTogglePizzaAvailability() {
	const queryClient = useQueryClient();
	const {
		mutate: togglePizzaAvailabilityMutation,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: ({
			pizzaId,
			isAvailable,
		}: {
			pizzaId: string;
			isAvailable: boolean;
		}) => pizzasApi.toggleAvailability(pizzaId, isAvailable),
		onMutate: async ({ pizzaId, isAvailable }) => {
			await queryClient.cancelQueries({ queryKey: ["pizzas"] });

			const previousPizzas = queryClient.getQueryData<Pizza[]>(["pizzas"]);

			queryClient.setQueryData<Pizza[]>(["pizzas"], (old) =>
				old?.map((i) =>
					i.id === pizzaId ? { ...i, is_available: isAvailable } : i,
				),
			);

			return { previousPizzas };
		},
		onError: (_err, _variables, context) => {
			queryClient.setQueryData(["pizzas"], context?.previousPizzas);
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["pizzas"],
			});
		},
	});
	return { togglePizzaAvailabilityMutation, isPending, isError, error };
}
export default useTogglePizzaAvailability;
