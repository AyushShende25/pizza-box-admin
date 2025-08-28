import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/menu/crust")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_layout/menu/crust"!</div>;
}
