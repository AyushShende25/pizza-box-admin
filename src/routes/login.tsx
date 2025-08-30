import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";
import { fetchCurrentUserOptions } from "@/api/authApi";
import LoginForm from "@/components/LoginForm";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.ensureQueryData(
			fetchCurrentUserOptions(),
		);
		if (user && user.role === "admin") {
			throw redirect({ to: "/", replace: true });
		}
	},
});

function RouteComponent() {
	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<Link
					to="/"
					className="flex items-center gap-2 self-center font-medium"
				>
					<div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
						<GalleryVerticalEnd className="size-4" />
					</div>
					Pizza Box
				</Link>
				<LoginForm />
			</div>
		</div>
	);
}
