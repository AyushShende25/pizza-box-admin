import { createFileRoute, Outlet } from "@tanstack/react-router";
import AppSidebar from "@/components/app-sidebar";
import Logo from "@/components/Logo";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_layout")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full">
				<AppSidebar />
				<div className="flex-1 flex flex-col min-w-0">
					<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
						<div className="flex h-14 items-center px-4 lg:px-6 ">
							<SidebarTrigger className="lg:hidden" />
							<div className="flex-1 flex justify-center">
								<Logo />
							</div>
						</div>
					</header>

					<main className="flex-1 overflow-auto">
						<div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
							<Outlet />
						</div>
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
