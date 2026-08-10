import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onFilterClick: () => void
  filterCount: () => void
}

export const SearchBar = ({
  searchQuery,
  onSearchChange,
  onFilterClick,
  filterCount,
}: SearchBarProps) => {
  return (
    <div className="flex gap-3">
      <div className="flex-1 relative">
        <Input
          placeholder="Search LIB by name or number..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-3 p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>
      <Button
        variant="outline"
        className="h-11 border-gray-200 hover:bg-gray-50 gap-2"
        onClick={onFilterClick}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filters
        {/* {filterCount() > 0 && (
          <Badge color="secondary" className="ml-2 h-5 px-1.5">
            {filterCount()}
          </Badge>
        )} */}
      </Button>
    </div>
  )
}
