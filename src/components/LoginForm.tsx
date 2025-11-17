import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { useLogin } from "@/api/authApi";
import FieldInfo from "@/components/FieldInfo";
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
import { cn } from "@/lib/utils";

const loginFormSchema = z.object({
	email: z.email("enter a valid email address"),
	password: z.string().min(1, "password cannot be empty"),
});
export type LoginFormType = z.infer<typeof loginFormSchema>;

export default function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const loginMutation = useLogin();

	const form = useForm({
		defaultValues: { email: "", password: "" },
		validators: {
			onChange: loginFormSchema,
			onSubmitAsync: async ({ value }) => {
				try {
					await loginMutation.mutateAsync(value);
					return undefined;
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
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Welcome back</CardTitle>
					<CardDescription>Login and manage your Restaurant!</CardDescription>
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
								<form.Field
									name="password"
									children={(field) => (
										<div className="grid gap-3">
											<Label htmlFor="password">Password</Label>
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
												aria-disabled={!canSubmit}
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
			<div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
				By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
				and <a href="#">Privacy Policy</a>.
			</div>
		</div>
	);
}
