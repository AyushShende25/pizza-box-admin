import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { useCreateCrust, useUpdateCrust } from "@/api/crustApi";
import FieldInfo from "@/components/FieldInfo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Crust } from "@/types/crust";

type CrustFormProps = {
	mode: "create" | "edit";
	crust?: Crust;
	crustId?: string;
};

const crustFormSchema = z.object({
	name: z.string().min(1, "name cannot be empty").max(100),
	description: z.string().optional(),
	price: z
		.number("please enter a valid number")
		.min(0, "Price must be positive"),
	sortOrder: z
		.number("please enter a valid number")
		.min(1, "sort-order must be positive"),
});
export type CrustFormType = z.infer<typeof crustFormSchema>;

function CrustForm({ mode, crust, crustId }: CrustFormProps) {
	const defaultValues: CrustFormType = {
		name: crust?.name ?? "",
		description: crust?.description,
		price: crust?.additionalPrice ?? 0,
		sortOrder: crust?.sortOrder ?? 0,
	};
	const createCrustMutation = useCreateCrust();
	const updateCrustMutation = useUpdateCrust();
	const form = useForm({
		defaultValues,
		validators: {
			onChange: crustFormSchema,
			onSubmitAsync: async ({ value, formApi }) => {
				try {
					if (mode === "create") {
						await createCrustMutation.mutateAsync(value);
					} else {
						if (!crustId) throw new Error("crust-id is required for edit");
						await updateCrustMutation.mutateAsync({ data: value, crustId });
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
					name="description"
					children={(field) => (
						<div className="grid gap-3">
							<Label>Description</Label>
							<Input
								name={field.name}
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								type="text"
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							<FieldInfo field={field} />
						</div>
					)}
				/>
				<form.Field
					name="price"
					children={(field) => (
						<div className="grid gap-3">
							<Label>Price</Label>
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
export default CrustForm;
