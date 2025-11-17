import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";
import {
	fetchSizesQueryOptions,
	useDeleteSize,
	useToggleSizeAvailability,
} from "@/api/sizeApi";
import { DataTable } from "@/components/data-table";
import SizeForm from "@/components/SizeForm";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { Size } from "@/types/size";

export const Route = createFileRoute("/_layout/menu/size")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(fetchSizesQueryOptions());
	},
});

function RouteComponent() {
	const { data } = useSuspenseQuery(fetchSizesQueryOptions());

	const toggleSizeAvailabilityMutation = useToggleSizeAvailability();
	const deleteSizeMutation = useDeleteSize();

	const columns: ColumnDef<Size>[] = [
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
			accessorKey: "display_name",
			header: "Display Name",
			cell: ({ row }) => (
				<div className="font-medium">
					<div className="truncate">{row.original.displayName}</div>
				</div>
			),
		},
		{
			accessorKey: "multiplier",
			header: "Multiplier",
			cell: ({ row }) => {
				const multiplier = Number(row.original.multiplier);
				return (
					<span className="font-medium whitespace-nowrap">
						x{multiplier.toFixed(2)}
					</span>
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
							toggleSizeAvailabilityMutation.mutateAsync({
								sizeId: row.original.id,
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
				const currentSize = data.find((s) => s.id === row.original.id);
				return (
					<div className="flex gap-4">
						<Trash2
							className="cursor-pointer text-destructive w-4 h-4"
							onClick={() => deleteSizeMutation.mutateAsync(row.original.id)}
						/>
						<Dialog>
							<DialogTrigger>
								<SquarePen className="text-muted-foreground cursor-pointer w-4 h-4" />
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle className="mb-2">Edit Pizza Sizes</DialogTitle>
								</DialogHeader>
								<SizeForm
									mode="edit"
									size={currentSize}
									sizeId={row.original.id}
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
					Pizza Size Menu
				</h1>
				<p className="text-sm sm:text-base text-muted-foreground">
					Manage your pizza sizes and availability.
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
							<DialogTitle className="mb-2">Add new Size</DialogTitle>
						</DialogHeader>
						<SizeForm mode="create" />
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
