import type { Topping } from "./toppings";

export type Pizza = {
	id: string;
	name: string;
	description: string;
	basePrice: number;
	imageUrl: string;
	isAvailable: boolean;
	featured: boolean;
	category: PizzaCategory;
	defaultToppings: Topping[];
	createdAt: string;
	updatedAt: string;
};

export const PIZZA_CATEGORY = {
	VEG: "veg",
	NONVEG: "non_veg",
} as const;

export type PizzaCategory =
	(typeof PIZZA_CATEGORY)[keyof typeof PIZZA_CATEGORY];

export type PizzaListResponse = {
	items: Pizza[];
	total: number;
	page: number;
	pages: number;
	limit: number;
};

export type FetchPizzaProps = {
	page?: number;
	limit?: number;
	sortBy?: string;
	name?: string;
	category?: PizzaCategory;
	isAvailable?: boolean;
};
