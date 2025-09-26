import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";
import { fetchCrustsQueryOptions } from "@/api/crustApi";
import CrustForm from "@/components/CrustForm";
import { DataTable } from "@/components/data-table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import useDeleteCrust from "@/hooks/mutations/useDeleteCrust";
import useToggleCrustAvailability from "@/hooks/mutations/useToggleCrustAvailability";
import type { Crust } from "@/types/crust";

export const Route = createFileRoute("/_layout/menu/crust")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(fetchCrustsQueryOptions());
	},
});

function RouteComponent() {
	const { data } = useSuspenseQuery(fetchCrustsQueryOptions());

	const { toggleCrustAvailabilityMutation } = useToggleCrustAvailability();
	const { deleteCrustMutation } = useDeleteCrust();
	const columns: ColumnDef<Crust>[] = [
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
			accessorKey: "description",
			header: "Description",
			cell: ({ row }) => (
				<div className="font-medium">
					<div className="truncate">{row.original.description}</div>
				</div>
			),
		},

		{
			accessorKey: "additional_price",
			header: "Price",
			cell: ({ row }) => {
				const price = Number(row.original.additional_price);
				return (
					<span className="font-medium whitespace-nowrap">
						₹{price.toFixed(2)}
					</span>
				);
			},
		},

		{
			accessorKey: "is_available",
			header: "Availability",
			cell: ({ row }) => {
				const isAvailable = row.original.is_available;
				return (
					<Switch
						onCheckedChange={(val) => {
							toggleCrustAvailabilityMutation({
								crustId: row.original.id,
								isAvailable: val,
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
				const currentCrust = data.find((c) => c.id === row.original.id);
				return (
					<div className="flex gap-4">
						<Trash2
							className="cursor-pointer text-destructive w-4 h-4"
							onClick={() => deleteCrustMutation(row.original.id)}
						/>
						<Dialog>
							<DialogTrigger>
								<SquarePen className="text-muted-foreground cursor-pointer w-4 h-4" />
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle className="mb-2">Edit Pizza</DialogTitle>
								</DialogHeader>
								<CrustForm
									mode="edit"
									crust={currentCrust}
									crustId={row.original.id}
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
					Crust Menu
				</h1>
				<p className="text-sm sm:text-base text-muted-foreground">
					Manage your crust offerings and availability.
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

			{/* Add new modal */}
			<div>
				<Dialog>
					<DialogTrigger className="text-primary-foreground bg-primary px-4 py-2 rounded-lg cursor-pointer hover:bg-primary/90">
						Add
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle className="mb-2">Add new Crust</DialogTitle>
						</DialogHeader>
						<CrustForm mode="create" />
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
