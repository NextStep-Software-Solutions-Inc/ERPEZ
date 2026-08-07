import { TIMELINE_TYPES } from './constants'

type TimelineType = typeof TIMELINE_TYPES[number]
interface TimelineTypeSelectorProps {
  selectedType: TimelineType
  onTypeChange: (type: TimelineType) => void
}

export function TimelineTypeSelector({ selectedType, onTypeChange }: TimelineTypeSelectorProps) {
  const types: ReadonlyArray<TimelineType> = TIMELINE_TYPES;
  return (
    <div className="flex w-full bg-gray-100 p-1 rounded-lg border border-gray-200">
      {types.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => {
            onTypeChange(type)
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${selectedType === type ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
        >
          {type}
        </button>
      ))}
    </div>
  )
}