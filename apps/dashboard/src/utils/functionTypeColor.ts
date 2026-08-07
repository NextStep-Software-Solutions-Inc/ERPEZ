// Get color classes based on function type
export const getColorClasses = (type: string) => {
    switch (type) {
        case 'CoreFunction':
            return {
                border: 'border-l-green-500',
                text: 'text-green-600',
                badge: 'bg-green-100 text-green-700 hover:bg-green-200',
            }
        case 'StrategicPriority':
            return {
                border: 'border-l-blue-500',
                text: 'text-blue-600',
                badge: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
            }
        case 'MandatorySupport':
            return {
                border: 'border-l-orange-500',
                text: 'text-orange-600',
                badge: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
            }
        default:
            return {
                border: 'border-l-gray-500',
                text: 'text-gray-600',
                badge: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            }
    }
}