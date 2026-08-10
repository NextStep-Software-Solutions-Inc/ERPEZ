import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import type { TableType } from "erpez-shared-lib";
import { Button } from "~/components/ui/button";
import { ChevronDown } from "lucide-react";

interface ToolbarProps<TData = any> {
    table: TableType<TData>;
    showColumnVisibility?: boolean;
}
export default function Toolbar<TData = any>({ table, showColumnVisibility }: ToolbarProps<TData>) {

    return (
        <>
            <div className="flex flex-row space-x-2 ">
                <Input
                    placeholder="Search Tenant ..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <Button variant={"ghost"} onClick={() => {
                    table.getColumn("name")?.setFilterValue("");
                }}>
                    Clear
                </Button>
            </div>

            <div className="grow flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                </div>
                <div className="flex items-center gap-2">
                    {showColumnVisibility &&
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Columns <ChevronDown />
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
                                                className="capitalize"
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
                        </DropdownMenu>}
                </div>
            </div>
        </>
    );
}
