import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import * as z from "zod";
import { useResetPassword } from "@/api/authApi";
import FieldInfo from "@/components/FieldInfo";
import Logo from "@/components/Logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({
	token: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
	component: RouteComponent,
	validateSearch: searchSchema,
});

const resetPasswordFormSchema = z
	.object({
		password: z
			.string()
			.min(8, "Password must be at least 8 characters long")
			.max(255),
		confirm: z.string(),
	})
	.refine((data) => data.password === data.confirm, {
		message: "Passwords don't match",
		path: ["confirm"], // path of error
	});
export type ResetPasswordFormType = z.infer<typeof resetPasswordFormSchema>;

function RouteComponent() {
	const { token } = Route.useSearch();

	const resetPassword = useResetPassword();

	const form = useForm({
		defaultValues: { password: "", confirm: "" },
		validators: {
			onChange: resetPasswordFormSchema,
			onSubmitAsync: async ({ value }) => {
				if (!token) return;
				try {
					await resetPassword.mutateAsync({ token, data: value });
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

	if (!token) {
		return (
			<div className="flex items-center justify-center flex-col gap-4 h-screen p-6">
				<Alert className="max-w-md" variant="destructive">
					<TriangleAlert />
					<AlertTitle>Invalid Link</AlertTitle>
					<AlertDescription>Missing or invalid reset token.</AlertDescription>
				</Alert>
				<Link to="/login">
					<Button variant={"link"} className="cursor-pointer">
						Back to Login
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="flex justify-center items-center min-h-svh ">
			<Card className="min-w-md">
				<CardHeader className="text-center">
					<div className="mb-6 mx-auto">
						<Logo />
					</div>
					<CardTitle className="text-xl">Reset your password</CardTitle>
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
									name="password"
									children={(field) => (
										<div className="grid gap-3">
											<Label htmlFor="password">New Password</Label>
											<Input
												id="password"
												type="password"
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
											<FieldInfo field={field} />
										</div>
									)}
								/>

								<form.Field
									name="confirm"
									children={(field) => (
										<div className="grid gap-3">
											<Label htmlFor="confirm">Confirm New Password</Label>
											<Input
												id="confirm"
												type="password"
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
