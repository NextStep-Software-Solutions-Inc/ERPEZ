import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        404
      </h1>
      <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-6">
        Page Not Found
      </h2>
      <p className="text-gray-500 dark:text-gray-300 mb-8 text-center max-w-md">
        Sorry, the page you're looking for doesn't exist.
      </p>
      <div className="flex gap-4">
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
