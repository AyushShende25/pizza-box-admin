import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";
import { useForgotPassword } from "@/api/authApi";
import FieldInfo from "@/components/FieldInfo";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
	component: RouteComponent,
});

const forgotPasswordFormSchema = z.object({
	email: z.email(),
});
export type ForgotPasswordFormType = z.infer<typeof forgotPasswordFormSchema>;

function RouteComponent() {
	const forgotPassword = useForgotPassword();

	const form = useForm({
		defaultValues: { email: "" },
		validators: {
			onChange: forgotPasswordFormSchema,
			onSubmitAsync: async ({ value }) => {
				try {
					await forgotPassword.mutateAsync(value);
					// biome-ignore lint/suspicious/noExplicitAny: <error typing>
				} catch (error: any) {
					const errorMessage =
						error?.response?.data?.message ||
						error?.message ||
						"Something went wrong. Please try again later.";
					return errorMessage;
				}
			},
		},
	});

	return (
		<div className="flex justify-center items-center min-h-svh ">
			<Card className="min-w-md">
				<CardHeader className="text-center">
					<div className="mb-6 mx-auto">
						<Logo />
					</div>
					<CardTitle className="text-xl">Forgot your password?</CardTitle>
					<CardDescription>
						Worry not! enter your registered email and we will send you a reset
						link
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<div className="grid gap-6">
							<div className="grid gap-6">
								<form.Field
									name="email"
									children={(field) => (
										<div className="grid gap-3">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												type="email"
												placeholder="m@example.com"
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
											<FieldInfo field={field} />
										</div>
									)}
								/>

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
												className="w-full"
												type="submit"
												disabled={!canSubmit}
											>
												{isSubmitting ? "..." : "Submit"}
											</Button>
										)}
									/>
								</div>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
