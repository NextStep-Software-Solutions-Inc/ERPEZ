// EmptyPerformanceMeasuresState component

export default function EmptyPerformanceMeasuresState() {
  return (
    <div className="p-6 border-2 border-dashed rounded-lg bg-gray-50 text-center">
      <p className="text-gray-600 text-sm">
        No performance measures added yet.
      </p>
      <p className="text-gray-500 text-xs mt-1">
        Click "Add Performance Measure" to get started.
      </p>
    </div>
  )
}