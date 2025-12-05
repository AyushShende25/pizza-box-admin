import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { fetchCurrentUserOptions } from "@/api/authApi";
import type { WSNotification } from "@/types/notifications";

type WSContextType = {
	socket: WebSocket | null;
	isConnected: boolean;
	sendMessage: (message: WSNotification) => void;
};

const WSContext = createContext<WSContextType | null>(null);

function WsProvider({ children }: { children: React.ReactNode }) {
	const { data: user, isPending: userPending } = useQuery(
		fetchCurrentUserOptions(),
	);

	const wsRef = useRef<WebSocket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const reconnectTimeoutRef = useRef<number | null>(null);
	const userRef = useRef<typeof user>(null);

	useEffect(() => {
		userRef.current = user;
	}, [user]);

	const queryClient = useQueryClient();

	const connect = () => {
		if (
			wsRef.current?.readyState === WebSocket.OPEN ||
			wsRef.current?.readyState === WebSocket.CONNECTING
		) {
			return;
		}

		const ws = new WebSocket(
			`${import.meta.env.VITE_PUBLIC_WS_URL}/notifications/ws/admin`,
		);
		ws.onopen = () => {
			console.log("WebSocket connection established");
			setIsConnected(true);
		};

		ws.onerror = (error) => {
			console.error("WebSocket error:", error);
		};

		ws.onclose = () => {
			console.log("WebSocket connection closed");
			setIsConnected(false);
			wsRef.current = null;

			if (userRef.current) {
				reconnectTimeoutRef.current = setTimeout(() => {
					console.log("Attempting to reconnect...");
					connect();
				}, 3000);
			}
		};

		ws.onmessage = (event) => {
			try {
				const message: WSNotification = JSON.parse(event.data);
				handleMessage(message);
			} catch (error) {
				console.error("Failed to parse WebSocket message:", error);
			}
		};
		wsRef.current = ws;
	};

	const disconnect = () => {
		console.log("Disconnecting WebSocket");

		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
			reconnectTimeoutRef.current = null;
		}

		if (wsRef.current) {
			wsRef.current.onclose = null;
			wsRef.current.close();
			wsRef.current = null;
		}

		setIsConnected(false);
	};

	const handleMessage = (message: WSNotification) => {
		console.log("Received message:", message);
		switch (message.type) {
			case "ORDER_CREATED":
			case "ORDER_STATUS_CHANGED":
			case "ORDER_DELAYED":
			case "ORDER_CANCELLED":
				toast.success(message.message);
				queryClient.invalidateQueries({ queryKey: ["orders"] });
				break;
			case "PAYMENT_SUCCESSFUL":
			case "PAYMENT_FAILED":
				toast.success(message.message);
				queryClient.invalidateQueries({ queryKey: ["orders"] });
				break;

			default:
				console.log("Unknown message type:", message.type);
		}
	};

	const sendMessage = (message: WSNotification) => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify(message));
		} else {
			console.error("WebSocket is not connected");
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <we only want to run connect() once on mount and run cleanup once on unmount, not re-run on re-renders>
	useEffect(() => {
		if (userPending) return;
		if (!user) {
			disconnect();
			return;
		}

		connect();

		return () => {
			disconnect();
		};
	}, [user, userPending]);

	return (
		<WSContext.Provider
			value={{
				socket: wsRef.current,
				isConnected,
				sendMessage,
			}}
		>
			{children}
		</WSContext.Provider>
	);
}

export default WsProvider;

export const useWS = () => useContext(WSContext);
