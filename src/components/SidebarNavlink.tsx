import { Link } from "@tanstack/react-router";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarMenuButton,
	SidebarMenuSub,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { MenuItem } from "@/types/nav";

function SidebarNavLink({ item }: { item: MenuItem }) {
	// If the item has children, render a collapsible menu
	if (item.children && item.children.length > 0) {
		return (
			<Collapsible defaultOpen className="group/collapsible">
				<CollapsibleTrigger asChild>
					<SidebarMenuButton asChild>
						<Link to={item.url}>
							<item.icon />
							<span>{item.title}</span>
						</Link>
					</SidebarMenuButton>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub>
						{item.children.map((child) => (
							<SidebarMenuSubItem key={child.title}>
								<SidebarMenuButton
									className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
									asChild
								>
									<Link
										to={child.url}
										activeOptions={{ exact: true }}
										activeProps={{ "data-active": true }}
									>
										<child.icon />
										<span>{child.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuSubItem>
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</Collapsible>
		);
	}

	// If no children, render a simple menu item
	return (
		<SidebarMenuButton
			className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
			asChild
		>
			<Link
				to={item.url}
				activeOptions={{ exact: true }}
				activeProps={{ "data-active": true }}
			>
				<item.icon />
				<span>{item.title}</span>
			</Link>
		</SidebarMenuButton>
	);
}

export default SidebarNavLink;
