import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";
import { uploadApi } from "@/api/uploadApi";
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
import useCreateTopping from "@/hooks/mutations/useCreateTopping";
import useUpdateTopping from "@/hooks/mutations/useUpdateTopping";
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
	is_available: z.boolean(),
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
			topping?.is_vegetarian === true ? TOPPING_TYPE.VEG : TOPPING_TYPE.NON_VEG,
		toppingImage: undefined,
		is_available: topping?.is_available ?? true,
	};

	const { createToppingMutation } = useCreateTopping();
	const { updateToppingMutation } = useUpdateTopping();

	const form = useForm({
		defaultValues,
		validators: {
			onChange: toppingFormSchema,
			onSubmitAsync: async ({ value, formApi }) => {
				try {
					if (mode === "create") {
						const imgUrl = await handleUpload(value.toppingImage);
						await createToppingMutation({ data: value, imgUrl });
					} else {
						if (!toppingId) throw new Error("topping-id is required for edit");
						const imgUrl = value.toppingImage
							? await handleUpload(value.toppingImage)
							: topping?.image_url;
						await updateToppingMutation({ data: value, toppingId, imgUrl });
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

	const handleUpload = async (file?: File) => {
		try {
			if (!file) return;
			const res = await uploadApi.getPresignedUrl("topping", file.type);
			await uploadApi.uploadToS3(res.uploadUrl, file);
			return res.fileUrl;
		} catch (error) {
			console.log("Topping image upload error:", error);
			toast.error("failed to upload topping image");
			throw new Error("Image upload failed. You can submit without an image.");
		}
	};

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
