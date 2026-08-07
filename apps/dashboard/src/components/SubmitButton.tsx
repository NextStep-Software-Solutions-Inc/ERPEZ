import { Loader } from 'lucide-react'
import type { ButtonProps } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SubmitButtonProps extends ButtonProps {
  loading?: boolean
}

export default function SubmitButton({ loading, ...props }: SubmitButtonProps) {
  return (
    <Button {...props} disabled={loading ?? props.disabled}>
      <Loader
        className={cn('animate-spin transition-all', {
          hidden: !loading,
        })}
      />
      {props.children}
    </Button>
  )
}
