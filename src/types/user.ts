export type User = {
	email: string;
	firstName: string;
	lastName: string;
	id: string;
	isVerified: boolean;
	createdAt: string;
	updatedAt: string;
	role: "admin" | "user";
};
