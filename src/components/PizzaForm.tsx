import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import * as z from "zod";
import { fetchToppingsQueryOptions } from "@/api/toppingsApi";
import FieldInfo from "@/components/FieldInfo";
import MultiSelect from "@/components/MultiSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import useCreatePizza from "@/hooks/mutations/useCreatePizza";
import useUpdatePizza from "@/hooks/mutations/useUpdatePizza";
import { handleUpload } from "@/lib/utils";
import { PIZZA_CATEGORY, type Pizza } from "@/types/pizza";

type PizzaFormProps = {
	mode: "create" | "edit";
	pizza?: Pizza;
	pizzaId?: string;
};

const defaultToppingSchema = z.object({ id: z.string(), name: z.string() });

const pizzaFormSchema = z.object({
	name: z.string().min(1, "name cannot be empty").max(255),
	description: z.string().min(1, "description cannot be empty"),
	basePrice: z
		.number("please enter a valid number")
		.min(1, "Price must be positive"),
	category: z.enum(PIZZA_CATEGORY, "choose the correct field"),
	pizzaImage: z
		.file()
		.max(10 * 1024 * 1024, "max file size allowed is: 10mb")
		.mime(["image/png", "image/jpeg", "image/webp"], "unsupported file type")
		.optional(),
	defaultToppings: z.array(defaultToppingSchema).optional(),
});

export type PizzaFormType = z.infer<typeof pizzaFormSchema>;
export type DefaultToppingType = z.infer<typeof defaultToppingSchema>;

function PizzaForm({ mode, pizza, pizzaId }: PizzaFormProps) {
	const defaultValues: PizzaFormType = {
		name: pizza?.name ?? "",
		description: pizza?.description ?? "",
		basePrice: pizza?.basePrice ?? 0,
		category: pizza?.category ?? PIZZA_CATEGORY.VEG,
		pizzaImage: undefined,
		defaultToppings: pizza?.defaultToppings ?? [],
	};

	const { data: toppingData, isPending } = useQuery(
		fetchToppingsQueryOptions(),
	);

	const { createPizzaMutation } = useCreatePizza();
	const { updatePizzaMutation } = useUpdatePizza();

	const form = useForm({
		defaultValues,
		validators: {
			onChange: pizzaFormSchema,
			onSubmitAsync: async ({ value, formApi }) => {
				try {
					if (mode === "create") {
						const imgUrl = await handleUpload("pizza", value.pizzaImage);
						await createPizzaMutation({ data: value, imgUrl });
					} else {
						if (!pizzaId) throw new Error("pizza-id is required for edit");
						const imgUrl = value.pizzaImage
							? await handleUpload("pizza", value.pizzaImage)
							: pizza?.imageUrl;
						await updatePizzaMutation({ data: value, pizzaId, imgUrl });
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
					name="basePrice"
					children={(field) => (
						<div className="grid gap-3">
							<Label>Base Price</Label>
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
					name="pizzaImage"
					children={(field) => (
						<div className="grid gap-3">
							<Label>Pizza Image</Label>
							<Input
								name={field.name}
								onBlur={field.handleBlur}
								type="file"
								onChange={(e) => field.handleChange(e.target.files?.[0])}
							/>
							<FieldInfo field={field} />
						</div>
					)}
				/>
				<form.Field
					name="category"
					children={(field) => (
						<div className="grid gap-3">
							<Label>Pizza type</Label>
							<Select
								value={field.state.value}
								onValueChange={(val) =>
									field.handleChange(val as typeof field.state.value)
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select Type" />
								</SelectTrigger>
								<SelectContent>
									{Object.values(PIZZA_CATEGORY).map((item) => (
										<SelectItem key={item} value={item}>
											{item}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldInfo field={field} />
						</div>
					)}
				/>
				{!isPending && (
					<form.Field
						name="defaultToppings"
						children={(field) => (
							<div className="grid gap-3">
								<Label>Default Toppings</Label>
								<MultiSelect<DefaultToppingType>
									options={toppingData ?? []}
									labelSelector={(t) => t.name}
									onChange={(selected) => field.handleChange(selected)}
									selected={field.state.value ?? []}
									valueSelector={(t) => t.id}
									placeholder="select toppings"
								/>
								<FieldInfo field={field} />
							</div>
						)}
					/>
				)}
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
export default PizzaForm;
