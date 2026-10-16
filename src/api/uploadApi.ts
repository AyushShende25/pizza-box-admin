import axios from "axios";
import { api } from "@/api/axios";

export const uploadApi = {
	uploadToS3: async (uploadUrl: string, file: File) => {
		await axios.put(uploadUrl, file, {
			headers: { "Content-Type": file.type },
		});
	},
	getPresignedUrl: async (entityType: string, contentType: string) => {
		const res = await api.post("/uploads/presigned-url", {
			entityType,
			contentType,
		});
		return res.data;
	},
};
