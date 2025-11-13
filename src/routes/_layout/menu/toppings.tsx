import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";
import { fetchToppingsQueryOptions } from "@/api/toppingsApi";
import { DataTable } from "@/components/data-table";
import ToppingForm from "@/components/ToppingForm";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import useDeleteTopping from "@/hooks/mutations/useDeleteTopping";
import useToggleToppingAvailability from "@/hooks/mutations/useToggleToppingAvailability";
import type { Topping } from "@/types/toppings";

export const Route = createFileRoute("/_layout/menu/toppings")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(fetchToppingsQueryOptions());
	},
});

function RouteComponent() {
	const { data } = useSuspenseQuery(fetchToppingsQueryOptions());
	const { deleteToppingMutation } = useDeleteTopping();
	const { toggleToppingAvailabilityMutation } = useToggleToppingAvailability();

	const columns: ColumnDef<Topping>[] = [
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
			accessorKey: "price",
			header: "Price",
			cell: ({ row }) => {
				const price = Number(row.original.price);
				return (
					<span className="font-medium whitespace-nowrap">
						₹{price.toFixed(2)}
					</span>
				);
			},
		},
		{
			accessorKey: "category",
			header: "Category",
		},
		{
			accessorKey: "is_vegetarian",
			header: "Type",
			cell: ({ row }) => (
				<span>
					{row.original.isVegetarian === true ? (
						<Badge className="bg-green-600">Veg</Badge>
					) : (
						<Badge variant="destructive">Non-Veg</Badge>
					)}
				</span>
			),
		},
		{
			accessorKey: "is_available",
			header: "Availability",
			cell: ({ row }) => {
				return (
					<Switch
						onCheckedChange={(val) => {
							toggleToppingAvailabilityMutation({
								toppingId: row.original.id,
								isAvailable: val,
							});
						}}
						checked={row.original.isAvailable}
					/>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const currentTopping = data.find(
					(topping) => topping.id === row.original.id,
				);

				return (
					<div className="flex gap-4">
						<Trash2
							onClick={() => deleteToppingMutation(row.original.id)}
							className="cursor-pointer text-destructive w-4 h-4"
						/>

						<Dialog>
							<DialogTrigger>
								<SquarePen className="text-muted-foreground cursor-pointer w-4 h-4" />
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle className="mb-2">Edit Topping</DialogTitle>
								</DialogHeader>
								<ToppingForm
									mode="edit"
									topping={currentTopping}
									toppingId={row.original.id}
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
					Toppings Menu
				</h1>
				<p className="text-sm sm:text-base text-muted-foreground">
					Manage your toppings and availability.
				</p>
			</div>

			{/* Table section*/}
			<div>
				<div className="overflow-x-auto">
					<div className="min-w-[640px]">
						<DataTable columns={columns} data={data} />
					</div>
				</div>
			</div>

			<div>
				<Dialog>
					<DialogTrigger className="text-primary-foreground bg-primary px-4 py-2 rounded-lg cursor-pointer hover:bg-primary/90">
						Add
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle className="mb-2">Add new Topping</DialogTitle>
						</DialogHeader>
						<ToppingForm mode="create" />
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
