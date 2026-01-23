using ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Queries.GetUACSCodeSegmentFiscalYearById;

/// <summary>
/// Query to retrieve a single UACS code segment fiscal year association by ID.
/// </summary>
public record GetUACSCodeSegmentFiscalYearByIdQuery(Guid Id) : IRequest<ApiResponse<UACSCodeSegmentFiscalYearResponse>>;
