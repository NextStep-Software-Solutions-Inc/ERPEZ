import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'

interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value: string
    onChange: (value: string) => void
    debounceMs?: number
    type?: string
}

export default function DebouncedInput({
    value,
    onChange,
    debounceMs = 300,
    type = 'text',
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
        />
    )
}