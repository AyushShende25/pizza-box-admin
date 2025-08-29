import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sizesApi } from "@/api/sizeApi";
import type { Size } from "@/types/size";

function useDeleteSize() {
	const queryClient = useQueryClient();
	const {
		mutate: deleteSizeMutation,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: (sizeId: string) => sizesApi.deleteSize(sizeId),
		onMutate: async (sizeId) => {
			await queryClient.cancelQueries({ queryKey: ["sizes"] });

			const previousSizes = queryClient.getQueryData<Size[]>(["sizes"]);

			queryClient.setQueryData<Size[]>(["sizes"], (old) =>
				old?.filter((i) => i.id !== sizeId),
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
	return { isError, isPending, error, deleteSizeMutation };
}
export default useDeleteSize;
