import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const data = [
  { name: 'Apr 6', value: 2400 },
  { name: 'Apr 12', value: 1398 },
  { name: 'Apr 18', value: 9800 },
  { name: 'Apr 24', value: 3908 },
  { name: 'Apr 30', value: 4800 },
  { name: 'May 6', value: 3800 },
  { name: 'May 12', value: 4300 },
  { name: 'May 18', value: 2100 },
  { name: 'May 24', value: 5000 },
  { name: 'May 30', value: 3200 },
  { name: 'Jun 5', value: 4100 },
  { name: 'Jun 11', value: 3900 },
  { name: 'Jun 17', value: 5200 },
  { name: 'Jun 23', value: 3300 },
  { name: 'Jun 30', value: 4900 },
]

export function OverviewChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="name" stroke="#888" />
          <YAxis hide />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
