import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Signatory } from '../types'

interface SignatoryState {
  id?: string
  name: string
  position: string
  department: string
  searchInput: string
  showSuggestions: boolean
  filteredSuggestions: Signatory[]
}

interface SignatorySearchFieldProps {
  label: string
  state: SignatoryState
  onStateChange: (state: SignatoryState) => void
  suggestions: Signatory[]
}

export function SignatorySearchField({
  label,
  state,
  onStateChange,
  suggestions,
}: SignatorySearchFieldProps) {
  const filterSuggestions = (input: string) => {
    if (!input.trim()) {
      return { searchInput: input, showSuggestions: false, filteredSuggestions: [] }
    }
    const filtered = suggestions.filter((s) =>
      s.name.toLowerCase().includes(input.toLowerCase())
    )
    return {
      searchInput: input,
      showSuggestions: true,
      filteredSuggestions: filtered,
    }
  }

  const handleSelectSignatory = (signatory: Signatory) => {
    onStateChange({
      ...state,
      id: signatory.id,
      name: signatory.name,
      position: signatory.position,
      department: signatory.department,
      searchInput: signatory.name,
      showSuggestions: false,
      filteredSuggestions: [],
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Label className="block mb-2">Search Signatory</Label>
          <Input
            value={state.searchInput || state.name}
            onChange={(e) => {
              const result = filterSuggestions(e.target.value)
              onStateChange({ ...state, ...result })
            }}
            onFocus={() => {
              if (state.name) {
                onStateChange({ ...state, searchInput: '', showSuggestions: true })
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                onStateChange({ ...state, showSuggestions: false })
              }, 200)
            }}
            placeholder="Type signatory name..."
            className="w-full"
          />
          {state.showSuggestions && state.filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10">
              {state.filteredSuggestions.map((sig) => (
                <button
                  key={sig.id}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelectSignatory(sig)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0 transition-colors"
                >
                  <p className="font-medium">{sig.name}</p>
                  <p className="text-xs text-gray-600">{sig.position}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label>Position</Label>
          <Input
            value={state.position}
            disabled
            className="bg-gray-50 cursor-not-allowed"
            placeholder="Position (auto-filled)"
          />
        </div>
        <div>
          <Label>Department</Label>
          <Input
            value={state.department}
            disabled
            className="bg-gray-50 cursor-not-allowed"
            placeholder="Department (auto-filled)"
          />
        </div>
      </CardContent>
    </Card>
  )
}
