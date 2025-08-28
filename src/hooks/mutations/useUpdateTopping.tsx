import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toppingsApi } from "@/api/toppingsApi";
import type { ToppingFormType } from "@/components/ToppingForm";

function useUpdateTopping() {
	const queryClient = useQueryClient();

	const {
		mutateAsync: updateToppingMutation,
		isError,
		isPending,
		error,
	} = useMutation({
		mutationFn: ({
			data,
			toppingId,
			imgUrl,
		}: {
			data: ToppingFormType;
			toppingId: string;
			imgUrl: string;
		}) => toppingsApi.updateTopping(toppingId, data, imgUrl),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["toppings"],
			});
			toast.success("topping update successful");
		},
	});

	return { updateToppingMutation, isPending, isError, error };
}
export default useUpdateTopping;
