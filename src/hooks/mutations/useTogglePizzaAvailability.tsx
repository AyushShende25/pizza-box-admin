import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pizzasApi } from "@/api/pizzasApi";
import type { FetchPizzaProps, PizzaListResponse } from "@/types/pizza";

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
			queryParams?: FetchPizzaProps;
		}) => pizzasApi.toggleAvailability(pizzaId, isAvailable),
		onMutate: async ({ pizzaId, isAvailable, queryParams }) => {
			const queryKey = ["pizzas", queryParams ?? {}];
			await queryClient.cancelQueries({ queryKey });

			const previousData =
				queryClient.getQueryData<PizzaListResponse>(queryKey);

			if (previousData) {
				queryClient.setQueryData<PizzaListResponse>(queryKey, {
					...previousData,
					items: previousData.items.map((pizza) =>
						pizza.id === pizzaId ? { ...pizza, isAvailable } : pizza,
					),
				});
			}

			return { previousData, queryKey };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousData && context?.queryKey) {
				queryClient.setQueryData(context.queryKey, context.previousData);
			}
		},
		onSettled: (_data, _err, { queryParams }) => {
			queryClient.invalidateQueries({
				queryKey: ["pizzas", queryParams ?? {}],
			});
		},
	});
	return { togglePizzaAvailabilityMutation, isPending, isError, error };
}
export default useTogglePizzaAvailability;
