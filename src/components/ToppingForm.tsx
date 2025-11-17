import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { useCreateTopping, useUpdateTopping } from "@/api/toppingsApi";
import FieldInfo from "@/components/FieldInfo";
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
import { handleUpload } from "@/lib/utils";
import { TOPPING_CATEGORY, TOPPING_TYPE, type Topping } from "@/types/toppings";

const toppingFormSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	price: z
		.number("please enter a valid number")
		.min(1, "Price must be positive"),
	description: z.string().optional(),
	category: z.enum(TOPPING_CATEGORY, "choose the correct field"),
	type: z.enum(TOPPING_TYPE, "choose the correct field"),
	toppingImage: z
		.file()
		.max(10 * 1024 * 1024, "max file size allowed is: 10mb")
		.mime(["image/png", "image/jpeg", "image/webp"], "unsupported file type")
		.optional(),
});

export type ToppingFormType = z.infer<typeof toppingFormSchema>;

type ToppingFormProps = {
	mode: "create" | "edit";
	topping?: Topping;
	toppingId?: string;
};

function ToppingForm({ mode, topping, toppingId }: ToppingFormProps) {
	const defaultValues: ToppingFormType = {
		name: topping?.name ?? "",
		price: topping?.price ?? 0,
		description: topping?.description,
		category: topping?.category ?? TOPPING_CATEGORY.VEGETABLE,
		type:
			topping?.isVegetarian === true ? TOPPING_TYPE.VEG : TOPPING_TYPE.NON_VEG,
		toppingImage: undefined,
	};

	const createToppingMutation = useCreateTopping();
	const updateToppingMutation = useUpdateTopping();

	const form = useForm({
		defaultValues,
		validators: {
			onChange: toppingFormSchema,
			onSubmitAsync: async ({ value, formApi }) => {
				try {
					if (mode === "create") {
						const imgUrl = await handleUpload("topping", value.toppingImage);
						await createToppingMutation.mutateAsync({ data: value, imgUrl });
					} else {
						if (!toppingId) throw new Error("topping-id is required for edit");
						const imgUrl = value.toppingImage
							? await handleUpload("topping", value.toppingImage)
							: topping?.imageUrl;
						await updateToppingMutation.mutateAsync({
							data: value,
							toppingId,
							imgUrl,
						});
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
					name="toppingImage"
					children={(field) => (
						<div className="grid gap-3">
							<Label>Topping Image</Label>
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
							<Label>Topping category</Label>
							<Select
								value={field.state.value}
								onValueChange={(val) =>
									field.handleChange(val as typeof field.state.value)
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									{Object.values(TOPPING_CATEGORY).map((item) => (
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
				<form.Field
					name="type"
					children={(field) => (
						<div className="grid gap-3">
							<Label>Topping type</Label>
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
									{Object.values(TOPPING_TYPE).map((item) => (
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

export default ToppingForm;
