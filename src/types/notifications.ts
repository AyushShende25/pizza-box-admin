export const NOTIFICATION_TYPE = {
	ORDER_UPDATE: "order_update",
	PAYMENT_UPDATE: "payment_update",
	DELIVERY_UPDATE: "delivery_update",
	CART_REMINDER: "cart_reminder",
	PROMOTION: "promotion",
	SYSTEM: "system",
} as const;

type NotificationType =
	(typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const NOTIFICATION_CHANNEL = {
	WEBSOCKET: "websocket",
	EMAIL: "email",
} as const;

type NotificationChannel =
	(typeof NOTIFICATION_CHANNEL)[keyof typeof NOTIFICATION_CHANNEL];

export const NOTIFICATION_PRIORITY = {
	LOW: "low",
	MEDIUM: "medium",
	HIGH: "high",
	URGENT: "urgent",
} as const;

type NotificationPriority =
	(typeof NOTIFICATION_PRIORITY)[keyof typeof NOTIFICATION_PRIORITY];

export type Notification = {
	userId: string;
	title: string;
	message: string;
	notificationType: NotificationType;
	priority: NotificationPriority;
	data: any;
	id: string;
	channels: [NotificationChannel];
	isRead: boolean;
	readAt: string;
	expiresAt?: string;
	createdAt: string;
	updatedAt: string;
};

export type WSNotification = {
	scope: string;
	type: string;
	title: string;
	message: string;
	priority: NotificationPriority;
	data: any;
	created_at: string;
};
