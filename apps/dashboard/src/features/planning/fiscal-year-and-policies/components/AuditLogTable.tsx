import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { formatCurrency } from '@/lib/fiscal-year-and-policies/utils';
import type { AuditLog } from '@/lib/fiscal-year-and-policies/types';

interface AuditLogTableProps {
  logs: AuditLog[];
  pageSize?: number;
}

type SortColumn =
  | 'timestamp'
  | 'user'
  | 'action'
  | 'oldValue'
  | 'newValue';
type SortDirection = 'asc' | 'desc';

export function AuditLogTable({
  logs,
  pageSize = 10,
}: AuditLogTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayPageSize, setDisplayPageSize] = useState(pageSize);

  // Extract unique actions for filter dropdown
  const uniqueActions = useMemo(() => {
    const actions = new Set(logs.map((log) => log.action));
    return Array.from(actions).sort();
  }, [logs]);

  // Filter logs based on selected actions and search query
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Apply action filter
      if (selectedActions.length > 0) {
        const actionMatches = selectedActions.some((action) =>
          log.action.includes(action) ||
          log.action.toLowerCase().includes(action.toLowerCase())
        );
        if (!actionMatches) return false;
      }

      // Apply search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          log.action.toLowerCase().includes(query) ||
          log.user.toLowerCase().includes(query) ||
          String(log.oldValue).toLowerCase().includes(query) ||
          String(log.newValue).toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [logs, selectedActions, searchQuery]);

  // Sort logs
  const sortedLogs = useMemo(() => {
    const sorted = [...filteredLogs];
    sorted.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortColumn) {
        case 'timestamp':
          aVal = new Date(a.timestamp).getTime();
          bVal = new Date(b.timestamp).getTime();
          break;
        case 'user':
          aVal = a.user.toLowerCase();
          bVal = b.user.toLowerCase();
          break;
        case 'action':
          aVal = a.action.toLowerCase();
          bVal = b.action.toLowerCase();
          break;
        case 'oldValue':
          aVal = typeof a.oldValue === 'number' ? a.oldValue : String(a.oldValue).toLowerCase();
          bVal = typeof b.oldValue === 'number' ? b.oldValue : String(b.oldValue).toLowerCase();
          break;
        case 'newValue':
          aVal = typeof a.newValue === 'number' ? a.newValue : String(a.newValue).toLowerCase();
          bVal = typeof b.newValue === 'number' ? b.newValue : String(b.newValue).toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredLogs, sortColumn, sortDirection]);

  // Paginate logs
  const totalPages = Math.ceil(sortedLogs.length / displayPageSize);
  const paginatedLogs = useMemo(() => {
    const startIdx = (currentPage - 1) * displayPageSize;
    return sortedLogs.slice(startIdx, startIdx + displayPageSize);
  }, [sortedLogs, currentPage, displayPageSize]);

  // Handle sort column change
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ChevronsUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const handleActionToggle = (action: string) => {
    setSelectedActions((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action]
    );
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedActions([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Empty state
  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <p className="text-muted-foreground">
            No audit logs yet. Changes will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <Card className="border-slate-200 bg-slate-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm">Filter Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Filter Dropdown + Combobox */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              Action Filter
            </label>
            <div className="space-y-2">
              {/* Dropdown for preset action categories */}
              <Select defaultValue="all">
                <SelectTrigger aria-label="Filter actions by category">
                  <SelectValue placeholder="Select action category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="threshold">Threshold Updates</SelectItem>
                  <SelectItem value="method">Method Changes</SelectItem>
                </SelectContent>
              </Select>

              {/* Combobox for searching actions */}
              <Combobox
                options={uniqueActions.map((action) => ({
                  value: action,
                  label: action,
                }))}
                value={undefined}
                onValueChange={(value: string) => {
                  if (value && !selectedActions.includes(value)) {
                    handleActionToggle(value);
                  }
                }}
                placeholder="Search and select specific actions..."
                searchPlaceholder="Type to search actions..."
                emptyMessage="No matching actions found."
              />
            </div>

            {/* Selected Actions Display */}
            {selectedActions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedActions.map((action) => (
                  <Badge
                    key={action}
                    variant="outline"
                    color="secondary"
                    className="cursor-pointer hover:bg-slate-300"
                    onClick={() => handleActionToggle(action)}
                  >
                    {action}
                    <span className="ml-1">×</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={selectedActions.length === 0}
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </div>

          {/* Active Filters Count */}
          {(selectedActions.length > 0 || searchQuery) && (
            <p className="text-xs text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} audit logs
            </p>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead>
                <button
                  onClick={() => handleSort('timestamp')}
                  className="flex items-center gap-1 font-semibold hover:text-slate-900"
                  aria-sort={
                    sortColumn === 'timestamp'
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  Timestamp
                  {getSortIcon('timestamp')}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('user')}
                  className="flex items-center gap-1 font-semibold hover:text-slate-900"
                  aria-sort={
                    sortColumn === 'user'
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  User
                  {getSortIcon('user')}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('action')}
                  className="flex items-center gap-1 font-semibold hover:text-slate-900"
                  aria-sort={
                    sortColumn === 'action'
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  Action
                  {getSortIcon('action')}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('oldValue')}
                  className="flex items-center gap-1 font-semibold hover:text-slate-900"
                  aria-sort={
                    sortColumn === 'oldValue'
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  Old Value
                  {getSortIcon('oldValue')}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('newValue')}
                  className="flex items-center gap-1 font-semibold hover:text-slate-900"
                  aria-sort={
                    sortColumn === 'newValue'
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  New Value
                  {getSortIcon('newValue')}
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.map((log) => (
              <TableRow key={log.id} className="hover:bg-slate-50">
                <TableCell className="text-xs whitespace-nowrap">
                  {log.timestamp.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs">{log.user}</TableCell>
                <TableCell className="text-xs font-medium text-slate-900">
                  {log.action}
                </TableCell>
                <TableCell className="text-xs">
                  {typeof log.oldValue === 'number'
                    ? formatCurrency(log.oldValue)
                    : log.oldValue}
                </TableCell>
                <TableCell className="text-xs font-medium">
                  {typeof log.newValue === 'number'
                    ? formatCurrency(log.newValue)
                    : log.newValue}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-900">
            Rows per page:
          </label>
          <Select
            value={String(displayPageSize)}
            onValueChange={(val) => {
              setDisplayPageSize(Number(val));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages || 1} ({sortedLogs.length} total)
        </div>

        <Pagination>
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              
              if (totalPages <= 5) {
                // Show all pages if 5 or fewer
                pageNum = i + 1;
              } else {
                // Calculate visible range centered around current page
                const rangeStart = Math.max(1, currentPage - 2);
                const rangeEnd = Math.min(totalPages, rangeStart + 4);
                
                // Adjust start if we're near the end
                const adjustedStart = Math.max(1, rangeEnd - 4);
                pageNum = adjustedStart + i;
              }
              
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setCurrentPage(pageNum)}
                    isActive={currentPage === pageNum}
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={
                      currentPage === pageNum ? 'page' : undefined
                    }
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                aria-disabled={currentPage === totalPages}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
