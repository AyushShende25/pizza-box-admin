import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pizzasApi } from "@/api/pizzasApi";
import type { FetchPizzaProps, PizzaListResponse } from "@/types/pizza";

function useTogglePizzaFeatured() {
	const queryClient = useQueryClient();
	const {
		mutate: togglePizzaFeaturedMutation,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: ({
			pizzaId,
			isFeatured,
		}: {
			pizzaId: string;
			isFeatured: boolean;
			queryParams?: FetchPizzaProps;
		}) => pizzasApi.toggleIsFeatured(pizzaId, isFeatured),
		onMutate: async ({ pizzaId, isFeatured, queryParams }) => {
			const queryKey = ["pizzas", queryParams ?? {}];
			await queryClient.cancelQueries({ queryKey });

			const previousData =
				queryClient.getQueryData<PizzaListResponse>(queryKey);

			if (previousData) {
				queryClient.setQueryData<PizzaListResponse>(queryKey, {
					...previousData,
					items: previousData.items.map((pizza) =>
						pizza.id === pizzaId ? { ...pizza, featured: isFeatured } : pizza,
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
	return { togglePizzaFeaturedMutation, isPending, isError, error };
}
export default useTogglePizzaFeatured;
