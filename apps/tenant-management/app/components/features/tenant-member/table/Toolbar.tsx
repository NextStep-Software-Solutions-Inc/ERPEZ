import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import type { TableType } from "erpez-shared-lib";
import { Button } from "~/components/ui/button";
import { ChevronDown, Search, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";

interface ToolbarProps<TData = any> {
    table: TableType<TData>;
    showColumnVisibility?: boolean;
}

export default function Toolbar<TData = any>({ table, showColumnVisibility = true }: ToolbarProps<TData>) {
    const searchValue = (table.getColumn("name")?.getFilterValue() as string) ?? "";
    const statusFilter = (table.getColumn("status")?.getFilterValue() as string) || "All";

    const handleClearSearch = () => {
        table.getColumn("name")?.setFilterValue("");
    };

    const handleStatusChange = (value: string) => {
        table.getColumn("status")?.setFilterValue(value === "All" ? undefined : value);
    };

    const handleResetAll = () => {
        table.getColumn("name")?.setFilterValue("");
        table.getColumn("status")?.setFilterValue(undefined);
    };

    const hasActiveFilters = Boolean(searchValue || (statusFilter && statusFilter !== "All"));

    return (
        <div className="flex items-center justify-between gap-3 w-full flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[280px] max-w-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search members by name or email..."
                        value={searchValue}
                        onChange={(event) =>
                            table.getColumn("name")?.setFilterValue(event.target.value)
                        }
                        className="pl-9 pr-8 h-9 text-xs"
                    />
                    {searchValue && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition"
                            title="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <Select value={statusFilter} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[130px] h-9 text-xs">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Disabled">Disabled</SelectItem>
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetAll}
                        className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                        Reset
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2">
                {showColumnVisibility && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 text-xs">
                                Columns <ChevronDown className="ml-1 h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize text-xs"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
}
