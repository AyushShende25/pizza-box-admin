import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pizzasApi } from "@/api/pizzasApi";
import type { PizzaFormType } from "@/components/PizzaForm";

function useUpdatePizza() {
	const queryClient = useQueryClient();

	const {
		mutateAsync: updatePizzaMutation,
		isError,
		isPending,
		error,
	} = useMutation({
		mutationFn: ({
			data,
			pizzaId,
			imgUrl,
		}: {
			data: PizzaFormType;
			pizzaId: string;
			imgUrl: string;
		}) => pizzasApi.updatePizza(pizzaId, data, imgUrl),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["pizzas"],
			});
			toast.success("pizza update successful");
		},
	});

	return { updatePizzaMutation, isPending, isError, error };
}
export default useUpdatePizza;
