import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sizesApi } from "@/api/sizeApi";
import type { SizeFormType } from "@/components/SizeForm";

function useUpdateSize() {
	const queryClient = useQueryClient();

	const {
		mutateAsync: updateSizeMutation,
		isError,
		isPending,
		error,
	} = useMutation({
		mutationFn: ({ data, sizeId }: { data: SizeFormType; sizeId: string }) =>
			sizesApi.updateSize(sizeId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["sizes"],
			});
			toast.success("Size update successful");
		},
	});

	return { updateSizeMutation, isPending, isError, error };
}
export default useUpdateSize;
