import type { Topping } from "./toppings";

export type Pizza = {
	id: string;
	name: string;
	description: string;
	basePrice: number;
	imageUrl: string;
	isAvailable: boolean;
	foodType: FoodType;
	isFeatured: boolean;
	defaultToppings: Topping[];
	createdAt: string;
	updatedAt: string;
};

export type PizzaListResponse = {
	items: Pizza[];
	total: number;
	page: number;
	pages: number;
	limit: number;
};

export type FetchPizzaParams = {
	page?: number;
	limit?: number;
	sortBy?: SortField;
	order?: SortOrder;
	name?: string;
	foodType?: FoodType;
	isAvailable?: boolean;
	isFeatured?: boolean;
};
export const FOOD_TYPE = {
	VEG: "veg",
	NONVEG: "non_veg",
} as const;

export type FoodType = (typeof FOOD_TYPE)[keyof typeof FOOD_TYPE];

export type SortField =
	| "created_at"
	| "is_available"
	| "is_featured"
	| "name"
	| "base_price"
	| "food_type";

export type SortOrder = "asc" | "desc";
