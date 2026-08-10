import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { InputColor } from '@/lib/type'

interface DebouncedInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange'
  > {
  value: string
  onChange: (value: string) => void
  debounceMs?: number
  type?: string
  color?: InputColor
}

export default function DebouncedInput({
  value,
  onChange,
  debounceMs = 300,
  type = 'text',
  color = 'primary',
  ...props
}: DebouncedInputProps) {
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(inputValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [inputValue, onChange, debounceMs])

  return (
    <Input
      {...props}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      type={type}
      color={color}
    />
  )
}
