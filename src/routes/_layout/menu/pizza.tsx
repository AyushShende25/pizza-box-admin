import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	fetchPizzasQueryOptions,
	useDeletePizza,
	useTogglePizzaAvailability,
	useTogglePizzaFeatured,
} from "@/api/pizzasApi";
import { DataTable } from "@/components/data-table";
import PizzaForm from "@/components/PizzaForm";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { PIZZA_CATEGORY, type Pizza } from "@/types/pizza";

export const Route = createFileRoute("/_layout/menu/pizza")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			fetchPizzasQueryOptions({ page: 1, limit: 4 }),
		);
	},
});

function RouteComponent() {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 4,
	});

	const { data } = useSuspenseQuery(
		fetchPizzasQueryOptions({
			page: pagination.pageIndex + 1,
			limit: pagination.pageSize,
		}),
	);

	const togglePizzaAvailabilityMutation = useTogglePizzaAvailability();
	const togglePizzaFeaturedMutation = useTogglePizzaFeatured();
	const deletePizzaMutation = useDeletePizza();

	const columns: ColumnDef<Pizza>[] = [
		{
			accessorKey: "image_url",
			header: "Image",
			cell: ({ row }) => {
				if (!row.original.imageUrl) {
					return (
						<div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
							<span className="text-xs text-gray-500">No img</span>
						</div>
					);
				}
				return (
					<div className="w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden flex-shrink-0">
						<img
							src={row.original.imageUrl}
							className="w-full h-full object-cover"
							alt={`${row.original.name} pizza`}
						/>
					</div>
				);
			},
		},
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => (
				<div className="font-medium">
					<div className="truncate">{row.original.name}</div>
				</div>
			),
		},
		{
			accessorKey: "default_toppings",
			header: "Default Toppings",
			cell: ({ row }) => {
				const defaultToppings = row.original.defaultToppings
					.map((t) => t.name)
					.join(", ");

				return <span>{defaultToppings || "-"}</span>;
			},
		},
		{
			accessorKey: "base_price",
			header: "Price",
			cell: ({ row }) => {
				const price = Number(row.original.basePrice);

				return (
					<span className="font-medium whitespace-nowrap">
						₹{price.toFixed(2)}
					</span>
				);
			},
		},
		{
			accessorKey: "category",
			header: "Type",
			cell: ({ row }) => (
				<span>
					{row.original.category === PIZZA_CATEGORY.VEG ? (
						<Badge className="bg-green-600">{row.original.category}</Badge>
					) : (
						<Badge variant="destructive">{row.original.category}</Badge>
					)}
				</span>
			),
		},
		{
			accessorKey: "featured",
			header: "Featured",
			cell: ({ row }) => {
				const isFeatured = row.original.featured;
				return (
					<Switch
						onCheckedChange={(val) => {
							togglePizzaFeaturedMutation.mutateAsync({
								pizzaId: row.original.id,
								isFeatured: val,
								queryParams: {
									page: pagination.pageIndex + 1,
									limit: pagination.pageSize,
								},
							});
						}}
						checked={isFeatured}
					/>
				);
			},
		},
		{
			accessorKey: "is_available",
			header: "Availability",
			cell: ({ row }) => {
				const isAvailable = row.original.isAvailable;
				return (
					<Switch
						onCheckedChange={(val) => {
							togglePizzaAvailabilityMutation.mutateAsync({
								pizzaId: row.original.id,
								isAvailable: val,
								queryParams: {
									page: pagination.pageIndex + 1,
									limit: pagination.pageSize,
								},
							});
						}}
						checked={isAvailable}
					/>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const currentPizza = data?.items?.find(
					(pizza) => pizza.id === row.original.id,
				);
				return (
					<div className="flex gap-4">
						<Trash2
							className="cursor-pointer text-destructive w-4 h-4"
							onClick={() =>
								deletePizzaMutation.mutateAsync({
									pizzaId: row.original.id,
									queryParams: {
										page: pagination.pageIndex + 1,
										limit: pagination.pageSize,
									},
									onPageRedirect: () => {
										// Only redirect if we're not on page 1 and this is the last item
										if (pagination.pageIndex > 0 && data?.items?.length === 1) {
											setPagination((prev) => ({
												...prev,
												pageIndex: prev.pageIndex - 1,
											}));
										}
									},
								})
							}
						/>
						<Dialog>
							<DialogTrigger>
								<SquarePen className="text-muted-foreground cursor-pointer w-4 h-4" />
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle className="mb-2">Edit Pizza</DialogTitle>
								</DialogHeader>
								<PizzaForm
									mode="edit"
									pizza={currentPizza}
									pizzaId={row.original.id}
								/>
							</DialogContent>
						</Dialog>
					</div>
				);
			},
		},
	];

	return (
		<div className="space-y-6">
			{/* Header section */}
			<div className="space-y-2">
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
					Pizza Menu
				</h1>
				<p className="text-sm sm:text-base text-muted-foreground">
					Manage your pizza offerings and availability.
				</p>
			</div>

			{/* Table section*/}
			<div>
				<div className="overflow-x-auto">
					<div className="min-w-[640px]">
						<DataTable
							columns={columns}
							data={data}
							pageCount={data?.pages}
							pagination={pagination}
							setPagination={setPagination}
						/>
					</div>
				</div>
			</div>

			{/* Add new modal */}
			<div>
				<Dialog>
					<DialogTrigger className="text-primary-foreground bg-primary px-4 py-2 rounded-lg cursor-pointer hover:bg-primary/90">
						Add
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle className="mb-2">Add new Pizza</DialogTitle>
						</DialogHeader>
						<PizzaForm mode="create" />
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
