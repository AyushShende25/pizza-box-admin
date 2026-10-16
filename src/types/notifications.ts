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
	payload: any;
	id: string;
	isRead: boolean;
	readAt: string;
	expiresAt?: string;
	createdAt: string;
};

export type WSNotification = {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	priority: NotificationPriority;
	payload: any;
	created_at: string;
};

export type NotificationStatus = "read" | "unread";

export type NotificationQueryParams = {
	limit?: number;
	status?: NotificationStatus;
	before?: Date;
};
