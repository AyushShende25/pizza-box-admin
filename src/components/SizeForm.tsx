import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import FieldInfo from "@/components/FieldInfo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useCreateSize from "@/hooks/mutations/useCreateSize";
import useUpdateSize from "@/hooks/mutations/useUpdateSize";
import type { Size } from "@/types/size";

type SizeFormProps = {
	mode: "create" | "edit";
	size?: Size;
	sizeId?: string;
};

const sizeFormSchema = z.object({
	name: z.string().min(1, "name cannot be empty").max(50),
	displayName: z.string().min(1, "display-name cannot be empty").max(100),
	multiplier: z
		.number("please enter a valid number")
		.min(1, "multiplier must be positive"),
	sortOrder: z
		.number("please enter a valid number")
		.min(1, "sort-order must be positive"),
});
export type SizeFormType = z.infer<typeof sizeFormSchema>;

function SizeForm({ mode, size, sizeId }: SizeFormProps) {
	const defaultValues: SizeFormType = {
		name: size?.name ?? "",
		displayName: size?.display_name ?? "",
		multiplier: size?.multiplier ?? 0,
		sortOrder: size?.sort_order ?? 0,
	};

	const { createSizeMutation } = useCreateSize();
	const { updateSizeMutation } = useUpdateSize();

	const form = useForm({
		defaultValues,
		validators: {
			onChange: sizeFormSchema,
			onSubmitAsync: async ({ value, formApi }) => {
				try {
					if (mode === "create") {
						await createSizeMutation(value);
					} else {
						if (!sizeId) throw new Error("size-id is required for edit");
						await updateSizeMutation({ data: value, sizeId });
					}
					return undefined;
					// biome-ignore lint/suspicious/noExplicitAny: <error typing>
				} catch (error: any) {
					const errorMessage =
						error?.response?.data?.message ||
						error?.message ||
						"Something went wrong. Please try again later.";

					return errorMessage;
				} finally {
					formApi.reset();
				}
			},
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<div className="grid sm:grid-cols-2 gap-4 mb-4">
				<form.Field
					name="name"
					children={(field) => (
						<div className="grid gap-3">
							<Label>Name</Label>
							<Input
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								type="text"
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							<FieldInfo field={field} />
						</div>
					)}
				/>
				<form.Field
					name="displayName"
					children={(field) => (
						<div className="grid gap-3">
							<Label>Display Name</Label>
							<Input
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								type="text"
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							<FieldInfo field={field} />
						</div>
					)}
				/>
				<form.Field
					name="multiplier"
					children={(field) => (
						<div className="grid gap-3">
							<Label>Multiplier</Label>
							<Input
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								type="number"
								onChange={(e) => field.handleChange(e.target.valueAsNumber)}
							/>
							<FieldInfo field={field} />
						</div>
					)}
				/>
				<form.Field
					name="sortOrder"
					children={(field) => (
						<div className="grid gap-3">
							<Label>Sort-Order</Label>
							<Input
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								type="number"
								onChange={(e) => field.handleChange(e.target.valueAsNumber)}
							/>
							<FieldInfo field={field} />
						</div>
					)}
				/>
			</div>
			<div className="text-center space-y-2">
				<form.Subscribe
					selector={(state) => [state.errorMap]}
					children={([errorMap]) =>
						errorMap.onSubmit ? (
							<div>
								<em className="text-destructive font-light">
									Form-Error: {errorMap.onSubmit}
								</em>
							</div>
						) : null
					}
				/>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
					children={([canSubmit, isSubmitting]) => (
						<Button
							type="submit"
							aria-disabled={!canSubmit}
							disabled={!canSubmit}
						>
							{isSubmitting ? "..." : "Submit"}
						</Button>
					)}
				/>
			</div>
		</form>
	);
}
export default SizeForm;
