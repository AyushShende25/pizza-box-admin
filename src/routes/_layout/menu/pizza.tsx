import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type {
	ColumnDef,
	PaginationState,
	SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, SquarePen, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	fetchPizzasQueryOptions,
	useDeletePizza,
	useTogglePizzaAvailability,
	useTogglePizzaFeatured,
} from "@/api/pizzasApi";
import { DataTable } from "@/components/data-table";
import PizzaForm from "@/components/PizzaForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import useDebounce from "@/hooks/useDebounce";
import {
	type FetchPizzaParams,
	PIZZA_CATEGORY,
	type Pizza,
	type PizzaCategory,
} from "@/types/pizza";

export const Route = createFileRoute("/_layout/menu/pizza")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			fetchPizzasQueryOptions({ page: 1, limit: 4, sortBy: "created_at:desc" }),
		);
	},
});

function RouteComponent() {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 4,
	});

	const [sorting, setSorting] = useState<SortingState>([
		{ id: "created_at", desc: true },
	]);

	const [filters, setFilters] = useState({
		name: "",
		category: "all",
		availability: "all",
		featured: "all",
	});
	const [searchInput, setSearchInput] = useState("");
	const debouncedSearchInput = useDebounce(searchInput);

	useEffect(() => {
		setFilters((prev) => ({ ...prev, name: debouncedSearchInput }));
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	}, [debouncedSearchInput]);

	const handleFilterChange = (key: keyof typeof filters, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	};

	const clearFilters = () => {
		setFilters({
			name: "",
			category: "all",
			availability: "all",
			featured: "all",
		});
		setSearchInput("");
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	};

	const hasActiveFilters =
		filters.name.trim() ||
		filters.category !== "all" ||
		filters.availability !== "all" ||
		filters.featured !== "all";

	const queryParams: FetchPizzaParams = useMemo(() => {
		const params: FetchPizzaParams = {
			page: pagination.pageIndex + 1,
			limit: pagination.pageSize,
			sortBy: `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}`,
		};

		if (filters.name.trim()) params.name = filters.name.trim();
		if (filters.category !== "all")
			params.category = filters.category as PizzaCategory;

		if (filters.availability !== "all")
			params.isAvailable = filters.availability === "available";

		if (filters.featured !== "all")
			params.featured = filters.featured === "featured";

		return params;
	}, [filters, pagination, sorting]);

	const { data } = useSuspenseQuery(fetchPizzasQueryOptions(queryParams));

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
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Name
						<ArrowUpDown className="ml-2 size-4" />
					</Button>
				);
			},
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
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Type
						<ArrowUpDown className="ml-2 size-4" />
					</Button>
				);
			},
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
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Featured
						<ArrowUpDown className="ml-2 size-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const isFeatured = row.original.featured;
				return (
					<Switch
						onCheckedChange={(val) => {
							togglePizzaFeaturedMutation.mutate({
								pizzaId: row.original.id,
								isFeatured: val,
								queryParams,
							});
						}}
						checked={isFeatured}
					/>
				);
			},
		},
		{
			accessorKey: "is_available",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Availability
						<ArrowUpDown className="ml-2 size-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const isAvailable = row.original.isAvailable;
				return (
					<Switch
						onCheckedChange={(val) => {
							togglePizzaAvailabilityMutation.mutate({
								pizzaId: row.original.id,
								isAvailable: val,
								queryParams,
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
								deletePizzaMutation.mutate({
									pizzaId: row.original.id,
									queryParams,
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

			<div className="flex flex-col sm:flex-row gap-4 justify-end">
				<Input
					placeholder="Search by name..."
					className="max-w-sm"
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
				/>

				<Select
					value={filters.category}
					onValueChange={(value) => handleFilterChange("category", value)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Category" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Categories</SelectItem>
						<SelectItem value={PIZZA_CATEGORY.VEG}>Vegetarian</SelectItem>
						<SelectItem value={PIZZA_CATEGORY.NONVEG}>
							Non-Vegetarian
						</SelectItem>
					</SelectContent>
				</Select>

				<Select
					value={filters.availability}
					onValueChange={(value) => handleFilterChange("availability", value)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Availability" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						<SelectItem value="available">Available</SelectItem>
						<SelectItem value="unavailable">Unavailable</SelectItem>
					</SelectContent>
				</Select>

				<Select
					value={filters.featured}
					onValueChange={(value) => handleFilterChange("featured", value)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Featured" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						<SelectItem value="featured">Featured</SelectItem>
						<SelectItem value="not-featured">Not Featured</SelectItem>
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
							data={data}
							pageCount={data?.pages}
							pagination={pagination}
							setPagination={setPagination}
							sorting={sorting}
							setSorting={setSorting}
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
