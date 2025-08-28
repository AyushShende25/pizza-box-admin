import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/")({
	component: App,
});

function App() {
	return <div>Dashboard page</div>;
}
