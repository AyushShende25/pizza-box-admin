import type { Topping } from "./toppings";

export type Pizza = {
	id: string;
	name: string;
	description: string;
	base_price: number;
	image_url: string;
	is_available: boolean;
	featured: boolean;
	category: PizzaCategory;
	default_toppings: Topping[];
	created_at: string;
	updated_at: string;
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
