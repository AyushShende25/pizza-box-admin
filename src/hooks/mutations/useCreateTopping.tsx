import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toppingsApi } from "@/api/toppingsApi";
import type { ToppingFormType } from "@/components/ToppingForm";

function useCreateTopping() {
	const queryClient = useQueryClient();

	const {
		mutateAsync: createToppingMutation,
		isError,
		isPending,
		error,
	} = useMutation({
		mutationFn: ({ data, imgUrl }: { data: ToppingFormType; imgUrl: string }) =>
			toppingsApi.createTopping(data, imgUrl),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["toppings"],
			});
			toast.success("new topping added");
		},
	});

	return { createToppingMutation, isPending, isError, error };
}
export default useCreateTopping;
