export const ORDER_STATUS = {
	PENDING: "pending",
	CONFIRMED: "confirmed",
	PREPARING: "preparing",
	OUT_FOR_DELIVERY: "out_for_delivery",
	DELIVERED: "delivered",
	CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
	PENDING: "pending",
	PAID: "paid",
	FAILED: "failed",
} as const;

export type PaymentStatus =
	(typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_METHOD = { DIGITAL: "digital", COD: "cod" } as const;

export type PaymentMethod =
	(typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export type FetchOrdersProps = {
	page?: number;
	limit?: number;
	sortBy?: string;
	orderStatus?: OrderStatus;
	paymentStatus?: PaymentStatus;
};

export type OrdersListResponse = {
	total: number;
	page: number;
	limit: number;
	pages: number;
	items: Order[];
};

export type Order = {
	id: string;
	orderNo: string;
	orderItems: OrderItem[];
	userId: string;
	orderStatus: OrderStatus;
	paymentStatus: PaymentStatus;
	subtotal: string;
	tax: string;
	deliveryCharge: string;
	total: string;
	deliveryAddress: string;
	notes?: string;
	paymentMethod: PaymentMethod;
	createdAt: string;
	updatedAt: string;
};

export type OrderItem = {
	id: string;
	toppings: { id: string; toppingName: string; toppingPrice: string }[];
	pizzaName: string;
	sizeName: string;
	crustName: string;
	sizePrice: string;
	crustPrice: string;
	basePizzaPrice: string;
	toppingsTotalPrice: string;
	unitPrice: string;
	totalPrice: string;
	quantity: number;
};

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
	pending: ["confirmed", "cancelled"],
	confirmed: ["preparing", "cancelled"],
	preparing: ["out_for_delivery"],
	out_for_delivery: ["delivered"],
	delivered: [],
	cancelled: [],
};
