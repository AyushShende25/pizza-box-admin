import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pizzasApi } from "@/api/pizzasApi";
import type { PizzaFormType } from "@/components/PizzaForm";

function useCreatePizza() {
	const queryClient = useQueryClient();

	const {
		mutateAsync: createPizzaMutation,
		isError,
		isPending,
		error,
	} = useMutation({
		mutationFn: ({ data, imgUrl }: { data: PizzaFormType; imgUrl: string }) =>
			pizzasApi.createPizza(data, imgUrl),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["pizzas"],
			});
			toast.success("new pizza added");
		},
	});

	return { createPizzaMutation, isPending, isError, error };
}
export default useCreatePizza;
