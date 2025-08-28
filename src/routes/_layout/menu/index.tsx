import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/menu/")({
	beforeLoad: () => {
		throw redirect({ to: "/menu/pizza" });
	},
});
