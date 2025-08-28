import axios from "axios";
import { api } from "@/api/axios";

export const uploadApi = {
	uploadToS3: async (uploadUrl: string, file: File) => {
		console.log(file, "file");

		await axios.put(uploadUrl, file, {
			headers: { "Content-Type": file.type, "x-amz-acl": "public-read" },
		});
	},
	getPresignedUrl: async (entity_type: string, content_type: string) => {
		const res = await api.post("/uploads/presigned-url", {
			entity_type,
			content_type,
		});
		return res.data;
	},
};
