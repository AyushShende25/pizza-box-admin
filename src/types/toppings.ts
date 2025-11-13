export const TOPPING_CATEGORY = {
	MEAT: "meat",
	VEGETABLE: "vegetable",
	CHEESE: "cheese",
	SAUCE: "sauce",
	SPICE: "spice",
} as const;

export type ToppingCategory =
	(typeof TOPPING_CATEGORY)[keyof typeof TOPPING_CATEGORY];

export const TOPPING_TYPE = { VEG: "veg", NON_VEG: "non_veg" } as const;

export type ToppingType = (typeof TOPPING_TYPE)[keyof typeof TOPPING_TYPE];

export type Topping = {
	id: string;
	name: string;
	price: number;
	description: string;
	category: ToppingCategory;
	isVegetarian: boolean;
	isAvailable: boolean;
	imageUrl: string;
	createdAt: string;
};
