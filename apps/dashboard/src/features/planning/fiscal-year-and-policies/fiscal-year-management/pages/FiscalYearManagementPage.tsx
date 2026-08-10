import { useSearch, useNavigate } from '@tanstack/react-router'
import FiscalYearManagement from '../index'

export default function FiscalYearManagementTab() {
  const navigate = useNavigate()
  const search = useSearch({
    from: '/v2/fiscal-year-and-policies/',
  })

  const page = search?.page || 1
  const limit = search?.limit || 10

  const handlePageChange = (newPage: number) => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, page: newPage }),
    })
  }

  const handlePageSizeChange = (newSize: number) => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, page: 1, limit: newSize }),
    })
  }

  return (
    <FiscalYearManagement
      currentPage={page}
      pageSize={limit}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  )
}
