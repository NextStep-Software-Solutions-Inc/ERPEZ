import { DevelopmentGoal } from '../types'

const developmentGoalColorMap: Array<{
  match: string[]
  className: string
}> = [
  { match: ['sdg 1', 'no poverty'], className: 'bg-red-100 text-red-800' },
  {
    match: ['sdg 2', 'zero hunger'],
    className: 'bg-yellow-100 text-yellow-800',
  },
  {
    match: ['sdg 3', 'good health and well-being'],
    className: 'bg-green-100 text-green-800',
  },
  {
    match: ['sdg 4', 'quality education'],
    className: 'bg-red-100 text-red-800',
  },
  { match: ['sdg 5', 'gender equality'], className: 'bg-red-100 text-red-800' },
  {
    match: ['sdg 6', 'clean water and sanitation'],
    className: 'bg-blue-100 text-blue-800',
  },
  {
    match: ['sdg 7', 'affordable and clean energy'],
    className: 'bg-yellow-100 text-yellow-800',
  },
  {
    match: ['sdg 8', 'decent work and economic growth'],
    className: 'bg-red-100 text-red-800',
  },
  {
    match: ['sdg 9', 'industry, innovation, and infrastructure'],
    className: 'bg-orange-100 text-orange-800',
  },
  {
    match: ['sdg 10', 'reduced inequalities'],
    className: 'bg-red-100 text-red-800',
  },
  {
    match: ['sdg 11', 'sustainable cities and communities'],
    className: 'bg-orange-100 text-orange-800',
  },
  {
    match: ['sdg 12', 'responsible consumption and production'],
    className: 'bg-orange-100 text-orange-800',
  },
  {
    match: ['sdg 13', 'climate action'],
    className: 'bg-green-100 text-green-800',
  },
  {
    match: ['sdg 14', 'life below water'],
    className: 'bg-blue-100 text-blue-800',
  },
  {
    match: ['sdg 15', 'life on land'],
    className: 'bg-green-100 text-green-800',
  },
  {
    match: ['sdg 16', 'peace, justice and strong institutions'],
    className: 'bg-blue-100 text-blue-800',
  },
  {
    match: ['sdg 17', 'partnerships for the goals'],
    className: 'bg-gray-100 text-gray-800',
  },
  { match: ['pdp chapter'], className: 'bg-indigo-100 text-indigo-800' },
]

const normalizeDevelopmentGoalName = (goalName: string) =>
  goalName.toLowerCase().trim()

export function getDevelopmentGoalColor(goalName: string): string {
  const normalizedGoalName = normalizeDevelopmentGoalName(goalName)

  const match = developmentGoalColorMap.find(({ match }) =>
    match.some((candidate) => normalizedGoalName.includes(candidate)),
  )

  if (match) {
    return match.className
  }

  const enumFallback = Object.values(DevelopmentGoal).find((value) => {
    const normalizedValue = normalizeDevelopmentGoalName(value)
    return (
      normalizedValue === normalizedGoalName ||
      normalizedValue.includes(normalizedGoalName) ||
      normalizedGoalName.includes(normalizedValue)
    )
  })

  if (enumFallback) {
    const fallbackMatch = developmentGoalColorMap.find(({ match }) =>
      match.some((candidate) => normalizedGoalName.includes(candidate)),
    )

    return fallbackMatch?.className ?? 'bg-gray-100 text-gray-800'
  }

  return 'bg-gray-100 text-gray-800'
}
