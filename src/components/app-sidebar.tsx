import {
	Cookie,
	Expand,
	LayoutDashboard,
	LogOut,
	Package,
	Pizza,
	Sparkles,
	Users,
	UtensilsCrossed,
} from "lucide-react";
import { useLogout } from "@/api/authApi";
import SidebarNavLink from "@/components/SidebarNavlink";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { MenuItem } from "@/types/nav";

export const menu: MenuItem[] = [
	{ title: "Dashboard", url: "/", icon: LayoutDashboard },
	{ title: "Orders", url: "/orders", icon: Package },
	{ title: "Users", url: "/users", icon: Users },
	{
		title: "Menu",
		url: "/menu",
		icon: UtensilsCrossed,
		children: [
			{ title: "Pizza", url: "/menu/pizza", icon: Pizza },
			{ title: "Crust", url: "/menu/crust", icon: Cookie },
			{ title: "Size", url: "/menu/size", icon: Expand },
			{ title: "Toppings", url: "/menu/toppings", icon: Sparkles },
		],
	},
];

function AppSidebar() {
	const logoutMutation = useLogout();
	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup className="py-4">
					<SidebarGroupContent>
						<SidebarMenu className="space-y-1">
							{menu.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarNavLink item={item} />
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="p-4">
				<Button
					size="sm"
					variant="outline"
					className="w-full justify-start gap-4 cursor-pointer"
					onClick={() => logoutMutation.mutateAsync()}
				>
					<LogOut />
					Sign Out
				</Button>
			</SidebarFooter>
		</Sidebar>
	);
}

export default AppSidebar;
