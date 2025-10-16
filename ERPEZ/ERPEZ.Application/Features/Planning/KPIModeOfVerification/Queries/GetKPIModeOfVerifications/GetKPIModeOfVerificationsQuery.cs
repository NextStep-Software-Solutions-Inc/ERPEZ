using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Queries.GetKPIModeOfVerifications;

public class GetKPIModeOfVerificationsQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.KPIModeOfVerification>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
