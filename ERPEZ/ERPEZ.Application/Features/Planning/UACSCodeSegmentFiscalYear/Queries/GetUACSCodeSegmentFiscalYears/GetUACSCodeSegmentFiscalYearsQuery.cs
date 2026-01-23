using ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Queries.GetUACSCodeSegmentFiscalYears;

/// <summary>
/// Query to retrieve all UACS code segment fiscal year associations with pagination and filtering.
/// </summary>
public record GetUACSCodeSegmentFiscalYearsQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Filters = null,
    string? Sorts = null
) : IRequest<PaginatedApiResponse<UACSCodeSegmentFiscalYearResponse>>;
