import type { FoodType } from "./pizza";

export const TOPPING_CATEGORY = {
	MEAT: "meat",
	VEGETABLE: "vegetable",
	CHEESE: "cheese",
	SAUCE: "sauce",
} as const;

export type ToppingCategory =
	(typeof TOPPING_CATEGORY)[keyof typeof TOPPING_CATEGORY];

export type Topping = {
	id: string;
	name: string;
	priceModifier: string;
	description: string;
	category: ToppingCategory;
	foodType: FoodType;
	isAvailable: boolean;
	imageUrl: string;
	createdAt: string;
};

export type FetchToppingsParams = {
	category?: ToppingCategory;
	foodType?: FoodType;
	isAvailable?: boolean;
};
