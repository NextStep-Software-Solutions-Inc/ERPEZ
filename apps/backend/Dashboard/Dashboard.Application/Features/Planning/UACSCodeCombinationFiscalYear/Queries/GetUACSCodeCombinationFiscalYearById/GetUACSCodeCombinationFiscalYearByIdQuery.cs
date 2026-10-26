using ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Queries.GetUACSCodeCombinationFiscalYearById;

/// <summary>
/// Query to retrieve a single UACS code combination fiscal year association by ID.
/// </summary>
public record GetUACSCodeCombinationFiscalYearByIdQuery(Guid Id) : IRequest<ApiResponse<UACSCodeCombinationFiscalYearResponse>>;
