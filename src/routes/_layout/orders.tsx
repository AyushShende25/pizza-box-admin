import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type {
	ColumnDef,
	PaginationState,
	SortingState,
} from "@tanstack/react-table";
import {
	ArrowUpDown,
	CircleCheck,
	CircleX,
	Eye,
	Loader,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { fetchOrdersQueryOptions, useUpdateOrderStatus } from "@/api/ordersApi";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { formatStatusLabel } from "@/lib/utils";
import {
	type FetchOrdersParams,
	ORDER_STATUS,
	type Order,
	type OrderStatus,
	PAYMENT_METHOD,
	PAYMENT_STATUS,
	type PaymentMethod,
	type PaymentStatus,
	VALID_TRANSITIONS,
} from "@/types/orders";

export const Route = createFileRoute("/_layout/orders")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			fetchOrdersQueryOptions({ page: 1, limit: 5 }),
		);
	},
});

function RouteComponent() {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});

	const [sorting, setSorting] = useState<SortingState>([
		{ id: "created_at", desc: true },
	]);

	const [filters, setFilters] = useState({
		orderStatus: "all",
		paymentStatus: "all",
		paymentMethod: "all",
	});

	const handleFilterChange = (key: keyof typeof filters, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	};

	const clearFilters = () => {
		setFilters({
			orderStatus: "all",
			paymentStatus: "all",
			paymentMethod: "all",
		});
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	};

	const hasActiveFilters =
		filters.orderStatus !== "all" ||
		filters.paymentStatus !== "all" ||
		filters.paymentMethod !== "all";

	const queryParams: FetchOrdersParams = useMemo(() => {
		const params: FetchOrdersParams = {
			page: pagination.pageIndex + 1,
			limit: pagination.pageSize,
			sortBy: `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}`,
		};

		if (filters.orderStatus !== "all")
			params.orderStatus = filters.orderStatus as OrderStatus;
		if (filters.paymentStatus !== "all")
			params.paymentStatus = filters.paymentStatus as PaymentStatus;
		if (filters.paymentMethod !== "all")
			params.paymentMethod = filters.paymentMethod as PaymentMethod;

		return params;
	}, [filters, pagination, sorting]);

	const updateOrderStatusMutation = useUpdateOrderStatus();
	const { data: orders } = useSuspenseQuery(
		fetchOrdersQueryOptions(queryParams),
	);
	console.log(orders.items);

	const columns: ColumnDef<Order>[] = [
		{
			accessorKey: "orderNo",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Order No.
						<ArrowUpDown className="ml-2 size-4" />
					</Button>
				);
			},
			cell: ({ row }) => (
				<div className="font-medium">
					<div className="truncate">{row.original.orderNo}</div>
				</div>
			),
		},
		{
			accessorKey: "orderStatus",
			header: "Status",
			cell: ({ row }) => (
				<div className="font-medium">
					<Badge variant={"secondary"}>
						{row.original.orderStatus === "delivered" ? (
							<span className="flex items-center gap-1">
								<CircleCheck className="size-3 bg-green-500 rounded-full" />
								{row.original.orderStatus}
							</span>
						) : (
							row.original.orderStatus
						)}
					</Badge>
				</div>
			),
		},
		{
			accessorKey: "paymentStatus",
			header: "Payment-Status",
			cell: ({ row }) => {
				const status = row.original.paymentStatus;
				return (
					<div className="font-medium">
						{status === "pending" && (
							<Badge variant={"outline"}>
								<Loader className="size-3" />
								{status}
							</Badge>
						)}
						{status === "paid" && (
							<Badge variant={"outline"}>
								<CircleCheck className="size-3 bg-green-500 rounded-full" />
								{status}
							</Badge>
						)}
						{status === "failed" && (
							<Badge variant={"outline"}>
								<CircleX className="size-3" />
								{status}
							</Badge>
						)}
					</div>
				);
			},
		},

		{
			accessorKey: "paymentMethod",
			header: "Payment-Method",
			cell: ({ row }) => (
				<div className="font-medium">
					<div className="truncate">{row.original.paymentMethod}</div>
				</div>
			),
		},
		{
			accessorKey: "total",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Price
						<ArrowUpDown className="ml-2 size-4" />
					</Button>
				);
			},
			cell: ({ row }) => (
				<div className="font-medium">
					<div className="truncate">₹{row.original.total}</div>
				</div>
			),
		},
		{
			accessorKey: "createdAt",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Date
						<ArrowUpDown className="ml-2 size-4" />
					</Button>
				);
			},
			cell: ({ row }) => (
				<div className="font-medium">
					<div className="truncate">
						{new Date(row.original.createdAt).toLocaleString("en-US", {
							year: "numeric",
							month: "short",
							day: "numeric",
							hour: "numeric",
							minute: "numeric",
						})}
					</div>
				</div>
			),
		},
		{
			id: "action",
			header: "view",
			cell: ({ row }) => {
				const order = row.original;
				return (
					<Sheet>
						<SheetTrigger>
							<Eye className="size-4 cursor-pointer" />
						</SheetTrigger>
						<SheetContent className="overflow-y-auto">
							<SheetHeader>
								<SheetTitle className="text-lg font-bold">
									Order Details
								</SheetTitle>
								<SheetDescription>
									Details for Order No.
									<span className="font-semibold">{row.original.orderNo}</span>
								</SheetDescription>
							</SheetHeader>
							<div className="space-y-8 py-4 px-2">
								<section className="space-y-2">
									<h3 className="font-semibold text-lg">Order Summary</h3>

									<div className="space-y-1 text-sm">
										<p>
											<span className="font-medium">Order Status:</span>{" "}
											<span className="capitalize">{order.orderStatus}</span>
										</p>

										<p>
											<span className="font-medium">Payment Status:</span>{" "}
											<span className="capitalize">{order.paymentStatus}</span>
										</p>

										<p>
											<span className="font-medium">Payment Method:</span>{" "}
											<span className="capitalize">{order.paymentMethod}</span>
										</p>

										<p>
											<span className="font-medium">Created At:</span>{" "}
											{new Date(order.createdAt).toLocaleString("en-US", {
												year: "numeric",
												month: "short",
												day: "numeric",
												hour: "numeric",
												minute: "numeric",
											})}
										</p>
									</div>
								</section>

								<Separator />

								<section className="space-y-2">
									<h3 className="font-semibold text-lg">Items</h3>

									<div className="space-y-4">
										{order.orderItems.map((i) => (
											<div
												key={i.id}
												className="border rounded-lg p-3 space-y-2 bg-muted/30"
											>
												<p className="font-medium">
													{i.pizzaName} – ₹{i.unitPrice}
												</p>

												<div className="text-sm space-y-1">
													<p>
														<span className="font-medium">Crust:</span>{" "}
														{i.crustName} (₹{i.crustPrice})
													</p>

													<p>
														<span className="font-medium">Size:</span>{" "}
														{i.sizeName} (₹
														{Number(i.sizePrice) - Number(i.basePizzaPrice)})
													</p>

													<div>
														<p className="font-medium">Toppings:</p>
														<ul className="ml-4 list-disc">
															{i.toppings.length > 0 ? (
																i.toppings.map((t) => (
																	<li key={t.id} className="text-sm">
																		{t.toppingName} – ₹{t.toppingPrice}
																	</li>
																))
															) : (
																<li className="text-sm text-muted-foreground">
																	No extra toppings
																</li>
															)}
														</ul>
													</div>

													<p>
														<span className="font-medium">Toppings Total:</span>{" "}
														₹{i.toppingsTotalPrice}
													</p>

													<p>
														<span className="font-medium">Quantity:</span>{" "}
														{i.quantity}
													</p>

													<p className="font-semibold">
														Line Total: ₹{i.totalPrice}
													</p>
												</div>
											</div>
										))}
									</div>
								</section>

								<Separator />

								<section className="space-y-2">
									<h3 className="font-semibold text-lg">Customer Info</h3>

									<div className="text-sm space-y-1">
										<p>
											<span className="font-medium">Delivery Address:</span>{" "}
											{order.deliveryAddress}
										</p>

										{order.notes && (
											<p>
												<span className="font-medium">Notes:</span>{" "}
												{order.notes}
											</p>
										)}
									</div>
								</section>

								<Separator />

								<section className="space-y-2">
									<h3 className="font-semibold text-lg">Billing Summary</h3>

									<div className="text-sm space-y-1">
										<p>
											<span className="font-medium">Subtotal:</span> ₹
											{order.subtotal}
										</p>
										<p>
											<span className="font-medium">Tax:</span> ₹{order.tax}
										</p>
										<p>
											<span className="font-medium">Delivery Charge:</span> ₹
											{order.deliveryCharge}
										</p>
										<p className="font-bold text-base">Total: ₹{order.total}</p>
									</div>
								</section>

								<Separator />

								<section className="space-y-3">
									<h3 className="font-semibold text-lg">Update Order Status</h3>
									<div className="flex flex-wrap gap-2">
										{VALID_TRANSITIONS[order.orderStatus].length === 0 && (
											<p className="text-sm text-muted-foreground">
												No further actions available.
											</p>
										)}
										{VALID_TRANSITIONS[order.orderStatus].map((status) => (
											<Button
												variant={
													status === ORDER_STATUS.CANCELLED
														? "destructive"
														: "outline"
												}
												key={status}
												onClick={() =>
													updateOrderStatusMutation.mutateAsync({
														orderId: order.id,
														orderStatus: status,
													})
												}
												disabled={updateOrderStatusMutation.isPending}
											>
												{updateOrderStatusMutation.isPending
													? "Updating..."
													: formatStatusLabel(status)}
											</Button>
										))}
									</div>
								</section>
							</div>
						</SheetContent>
					</Sheet>
				);
			},
		},
	];
	return (
		<div className="space-y-6">
			{/* Header section */}
			<div className="space-y-2">
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
					Orders
				</h1>
				<p className="text-sm sm:text-base text-muted-foreground">
					Manage latest orders.
				</p>
			</div>

			<div className="flex flex-col sm:flex-row gap-4 justify-end">
				<Select
					value={filters.orderStatus}
					onValueChange={(v) => handleFilterChange("orderStatus", v)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Order-Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						{Object.values(ORDER_STATUS).map((s) => (
							<SelectItem className="capitalize" key={s} value={s}>
								{s}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={filters.paymentStatus}
					onValueChange={(v) => handleFilterChange("paymentStatus", v)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Payment-Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						{Object.values(PAYMENT_STATUS).map((p) => (
							<SelectItem className="capitalize" key={p} value={p}>
								{p}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={filters.paymentMethod}
					onValueChange={(v) => handleFilterChange("paymentMethod", v)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Payment-Method" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						{Object.values(PAYMENT_METHOD).map((p) => (
							<SelectItem className="capitalize" key={p} value={p}>
								{p}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{hasActiveFilters && (
					<Button onClick={clearFilters} variant="ghost" className="gap-2">
						<X className="size-4" />
						Clear Filters
					</Button>
				)}
			</div>

			{/* Table section*/}
			<div>
				<div className="overflow-x-auto">
					<div className="min-w-[640px]">
						<DataTable
							columns={columns}
							data={orders}
							pageCount={orders?.pages}
							pagination={pagination}
							setPagination={setPagination}
							sorting={sorting}
							setSorting={setSorting}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
