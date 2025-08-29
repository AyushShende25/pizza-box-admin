import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sizesApi } from "@/api/sizeApi";
import type { SizeFormType } from "@/components/SizeForm";

function useCreateSize() {
	const queryClient = useQueryClient();

	const {
		mutateAsync: createSizeMutation,
		isError,
		isPending,
		error,
	} = useMutation({
		mutationFn: (data: SizeFormType) => sizesApi.createSize(data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["sizes"],
			});
			toast.success("new size added");
		},
	});

	return { createSizeMutation, isPending, isError, error };
}
export default useCreateSize;
