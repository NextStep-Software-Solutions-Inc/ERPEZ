import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import OpcrPage from '@/pages/planning/opcr/OpcrPage'

export const Route = createFileRoute('/v1/planning/opcr/')({
    component: OpcrPage,
    validateSearch: z.object({
        search: z.string().optional(),
    }),
})