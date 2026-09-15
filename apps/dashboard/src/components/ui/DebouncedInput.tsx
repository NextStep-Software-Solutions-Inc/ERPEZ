import { useEffect, useState, useRef } from 'react'
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
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange

    useEffect(() => {
        setInputValue(value)
    }, [value])

    useEffect(() => {
        if (inputValue === value) return

        const timer = setTimeout(() => {
            onChangeRef.current(inputValue)
        }, debounceMs)

        return () => clearTimeout(timer)
    }, [inputValue, value, debounceMs])

    return (
        <Input
            {...props}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            type={type}
        />
    )
}