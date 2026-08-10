import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Loader2 } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getFundingSourcesRequest } from '../handlers/getFundingSourcesRequest'
import type { FundingSource } from '../types/fundingSourceTypes'

// Create hook at module level to avoid recreation on each render
const useFundingSourcesList = createQueryHookFromTemplate(getFundingSourcesRequest)

interface ParentFundingSourceSelectProps {
  value: string | undefined | null
  onChange: (value: string) => void
  isRequired?: boolean
  disabled?: boolean
  label?: string
  excludeId?: string // Exclude current funding source from parent options
}

export function ParentFundingSourceSelect({
  value,
  onChange,
  isRequired = false,
  disabled = false,
  label = 'Parent',
  excludeId,
}: ParentFundingSourceSelectProps) {
  const [searchInput, setSearchInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { data, isLoading } = useFundingSourcesList({
    pathParams: {},
    queryParams: {},
  })

  // Get funding sources from paginated response
  const fundingSources = useMemo(() => {
    return (data?.data || []).filter(
      (fs) => !excludeId || fs.id !== excludeId
    )
  }, [data?.data, excludeId])

  // Find the selected funding source for display
  const selectedFundingSource = useMemo(() => {
    if (!value || !value.trim()) return null
    const found = fundingSources.find((fs) => fs.id === value)
    return found || null
  }, [fundingSources, value])

  // Filter suggestions based on search input
  const filteredSuggestions = useMemo(() => {
    if (!searchInput.trim()) return []

    const query = searchInput.toLowerCase()
    return fundingSources.filter(
      (fs) =>
        fs.name.toLowerCase().includes(query) ||
        fs.code.toLowerCase().includes(query)
    )
  }, [fundingSources, searchInput])

  const handleSelect = (fundingSource: FundingSource) => {
    onChange(fundingSource.id)
    setSearchInput(`${fundingSource.name} (${fundingSource.code})`)
    setShowSuggestions(false)
  }

  const handleInputChange = (inputValue: string) => {
    setSearchInput(inputValue)
    if (inputValue.trim()) {
      onChange('')
      setShowSuggestions(true)
    } else {
      // User cleared the input completely
      onChange('')
      setSearchInput('')
      setShowSuggestions(false)
    }
  }

  const handleInputFocus = () => {
    if (selectedFundingSource && !searchInput) {
      // Already selected, clear search to allow re-search
      setSearchInput('')
      setShowSuggestions(true)
    } else if (searchInput) {
      setShowSuggestions(true)
    }
  }

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }



  const displayValue = searchInput || (value && selectedFundingSource
    ? `${selectedFundingSource.name} (${selectedFundingSource.code})`
    : '')

  return (
    <FormItem>
      <FormLabel className="text-sm font-medium">
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </FormLabel>
      <div className="relative">
        <FormControl>
          <Input
            value={displayValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={`Search by name or code${isRequired ? '' : ' (optional)'}`}
            disabled={disabled || isLoading}
            autoComplete="off"
            className="pr-10"
          />
        </FormControl>
        {isLoading && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
        )}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((fundingSource) => (
              <button
                key={fundingSource.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(fundingSource)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {fundingSource.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Code: {fundingSource.code}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        {showSuggestions && !isLoading && filteredSuggestions.length === 0 && searchInput && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 text-sm text-gray-500">
            No funding sources found
          </div>
        )}
      </div>
      <FormMessage />
    </FormItem>
  )
}
