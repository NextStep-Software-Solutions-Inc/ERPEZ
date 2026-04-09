using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Queries.GetMFOPAPs;

public record GetMFOPAPsQuery : PaginatedQuery<PaginatedApiResponse<MFOPAPResponse>>
{
    public Guid? FiscalYearId { get; init; }
}
