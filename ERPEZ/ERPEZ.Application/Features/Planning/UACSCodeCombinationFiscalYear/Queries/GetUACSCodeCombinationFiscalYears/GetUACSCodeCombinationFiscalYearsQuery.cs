using ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Queries.GetUACSCodeCombinationFiscalYears;

/// <summary>
/// Query to retrieve all UACS code combination fiscal year associations with pagination and filtering.
/// </summary>
public record GetUACSCodeCombinationFiscalYearsQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Filters = null,
    string? Sorts = null
) : IRequest<PaginatedApiResponse<UACSCodeCombinationFiscalYearResponse>>;
