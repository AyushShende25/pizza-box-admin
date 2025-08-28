export type Pizza = {
	id: string;
	name: string;
	description: string;
	base_price: number;
	image_url: string;
	is_available: boolean;
	category: PizzaCategory;
	default_toppings: string[];
	created_at: string;
	updated_at: string;
};

export const PIZZA_CATEGORY = {
	VEG: "veg",
	NONVEG: "non_veg",
} as const;

export type PizzaCategory =
	(typeof PIZZA_CATEGORY)[keyof typeof PIZZA_CATEGORY];
