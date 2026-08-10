import { PaginationResponse } from "erpez-shared-lib"

const createPaginatedResponse = <T>(data: T[]): PaginationResponse<T> => {
    return {
        data,
        pageSize: data.length,
        pageNumber: 1,
        totalPageNumber: 1,
        message: 'Mock data',
        totalRows: data.length,
        succeeded: true,
        errors: {},
        loadMore: false
    }
}

export { createPaginatedResponse }