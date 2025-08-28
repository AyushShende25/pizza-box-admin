import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toppingsApi } from "@/api/toppingsApi";
import type { Topping } from "@/types/toppings";

function useDeleteTopping() {
	const queryClient = useQueryClient();
	const {
		mutate: deleteToppingMutation,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: (toppingId: string) => toppingsApi.deleteTopping(toppingId),
		onMutate: async (toppingId) => {
			await queryClient.cancelQueries({ queryKey: ["toppings"] });

			const previousToppings = queryClient.getQueryData<Topping[]>([
				"toppings",
			]);

			queryClient.setQueryData<Topping[]>(["toppings"], (old) =>
				old?.filter((i) => i.id !== toppingId),
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
	return { isError, isPending, error, deleteToppingMutation };
}
export default useDeleteTopping;
