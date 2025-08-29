import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sizesApi } from "@/api/sizeApi";
import type { Size } from "@/types/size";

function useToggleSizeAvailability() {
	const queryClient = useQueryClient();
	const {
		mutate: toggleSizeAvailabilityMutation,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: ({
			sizeId,
			isAvailable,
		}: {
			sizeId: string;
			isAvailable: boolean;
		}) => sizesApi.toggleAvailability(sizeId, isAvailable),
		onMutate: async ({ sizeId, isAvailable }) => {
			await queryClient.cancelQueries({ queryKey: ["sizes"] });

			const previousSizes = queryClient.getQueryData<Size[]>(["sizes"]);

			queryClient.setQueryData<Size[]>(["sizes"], (old) =>
				old?.map((i) =>
					i.id === sizeId ? { ...i, is_available: isAvailable } : i,
				),
			);

			return { previousSizes };
		},
		onError: (_err, _variables, context) => {
			queryClient.setQueryData(["sizes"], context?.previousSizes);
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["sizes"],
			});
		},
	});
	return { toggleSizeAvailabilityMutation, isPending, isError, error };
}
export default useToggleSizeAvailability;
