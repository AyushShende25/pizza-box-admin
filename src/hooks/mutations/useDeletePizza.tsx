import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pizzasApi } from "@/api/pizzasApi";
import type { Pizza } from "@/types/pizza";

function useDeletePizza() {
	const queryClient = useQueryClient();
	const {
		mutate: deletePizzaMutation,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: (pizzaId: string) => pizzasApi.deletePizza(pizzaId),
		onMutate: async (pizzaId) => {
			await queryClient.cancelQueries({ queryKey: ["pizzas"] });

			const previousPizzas = queryClient.getQueryData<Pizza[]>(["pizzas"]);

			queryClient.setQueryData<Pizza[]>(["pizzas"], (old) =>
				old?.filter((i) => i.id !== pizzaId),
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
	return { isError, isPending, error, deletePizzaMutation };
}
export default useDeletePizza;
