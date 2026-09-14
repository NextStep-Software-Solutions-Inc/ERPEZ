import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    type ColumnFiltersState,
    getFilteredRowModel,
    type VisibilityState,
    type TableType,
} from "erpez-shared-lib";

import { Button } from "~/components/ui/button";
import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { useDynamicTableSize } from "~/hooks/use-dynamic-table-size";

interface TemplateTableProps<T> {
    title?: string
    description?: string
    columns: ColumnDef<T>[]
    data: T[];
    actions?: React.ReactNode[];
    readonly?: boolean;
    /** Override dynamic page sizing with a fixed page size */
    fixedPageSize?: number;
    /** Minimum number of rows to display when using dynamic sizing */
    minRows?: number;
    /** Maximum number of rows to display when using dynamic sizing */
    forTab?: boolean;
    maxRows?: number;
    toolbar?: (table: TableType<T>) => React.ReactNode
}

export function TemplateTable<T>({
    title,
    description,
    columns,
    data,
    actions,
    readonly = true,
    toolbar,
    fixedPageSize,
    minRows = 5,
    maxRows = 50,
    forTab,
}: TemplateTableProps<T>) {
    const dynamicPageSize = useDynamicTableSize({
        minRows,
        maxRows,
        reservedHeight: forTab ? 400 : 350, // Adjusted for header, toolbar, pagination
    });

    const pageSize = fixedPageSize || dynamicPageSize;

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    );
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        initialState: {
            pagination: {
                pageSize,
            },
        },
        meta: {
            readonly,
            actions
        }
    });

    // Update page size when it changes
    React.useEffect(() => {
        table.setPageSize(pageSize);
    }, [pageSize, table]);


    return (
        <div className="w-full flex flex-col h-full p-2">
            {title && <h2 className="text-2xl font-bold">{title}</h2>}
            {description && <p className="text-muted-foreground pt-2">{description}</p>}
            <div className="flex items-center py-4 gap-1 flex-wrap ">
                {toolbar?.(table)}
            </div>
            <div className="rounded-md border flex-1 flex flex-col min-h-0">
                <Table>
                    <TableHeader className=" bg-transparent border rounded-t-3xl">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="text-gray-500">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody >
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className={`text-left relative ${cell.column.id !== 'select' && cell.column.id !== 'actions' ? 'pl-6' : ''}`}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-row items-center justify-between space-x-2 py-4">
                <div className="text-muted-foreground text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="text-muted-foreground text-sm">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
                <div className="flex space-x-2">
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
            </div>
        </div>
    );
}
