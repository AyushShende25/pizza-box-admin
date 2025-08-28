export type MenuItem = {
	title: string;
	url: string;
	icon: React.ElementType;
	children?: MenuItem[];
};
