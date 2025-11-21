import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	type PaginationState,
	type SortingState,
	type TableState,
	useReactTable,
} from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data:
		| TData[]
		| {
				items: TData[];
				page: number;
				pages: number;
				limit: number;
				total: number;
		  };
	pageCount?: number;
	pagination?: PaginationState;
	setPagination?: React.Dispatch<React.SetStateAction<PaginationState>>;
	sorting?: SortingState;
	setSorting?: React.Dispatch<React.SetStateAction<SortingState>>;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	pageCount,
	pagination,
	setPagination,
	sorting,
	setSorting,
}: DataTableProps<TData, TValue>) {
	const items = Array.isArray(data) ? data : data.items;

	const tableState: Partial<TableState> = {};
	if (pagination) tableState.pagination = pagination;
	if (sorting) tableState.sorting = sorting;

	const table = useReactTable({
		data: items,
		columns,
		getCoreRowModel: getCoreRowModel(),
		pageCount: pagination ? pageCount : undefined,
		state: tableState,
		manualPagination: !!pagination,
		manualSorting: !!sorting,
		onPaginationChange: pagination && setPagination ? setPagination : undefined,
		onSortingChange: setSorting,
	});

	return (
		<div>
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead className="text-center" key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell className="text-center" key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			{pagination && setPagination && (
				<div className="flex items-center justify-end space-x-2 py-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			)}
		</div>
	);
}
