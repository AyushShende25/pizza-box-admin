import { type ClassValue, clsx } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { uploadApi } from "@/api/uploadApi";
import type { OrderStatus } from "@/types/orders";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type EntityType = "topping" | "pizza" | "user";

export const handleUpload = async (entityType: EntityType, file?: File) => {
	try {
		if (!file) return;
		const res = await uploadApi.getPresignedUrl(entityType, file.type);
		await uploadApi.uploadToS3(res.uploadUrl, file);
		return res.fileUrl;
	} catch (error) {
		console.log(`${entityType} image upload error:`, error);
		toast.error(`failed to upload ${entityType} image`);
		throw new Error("Image upload failed. You can submit without an image.");
	}
};

export const formatStatusLabel = (status: OrderStatus): string => {
	const labels: Record<OrderStatus, string> = {
		confirmed: "Confirm Order",
		preparing: "Start Preparing",
		out_for_delivery: "Out for Delivery",
		delivered: "Mark Delivered",
		cancelled: "Cancel Order",
		pending: "Pending",
	};

	return labels[status] || status;
};
