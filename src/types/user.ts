export type User = {
	email: string;
	first_name: string;
	last_name: string;
	id: string;
	is_verified: boolean;
	created_at: string;
	updated_at: string;
	role: "admin" | "user";
};
