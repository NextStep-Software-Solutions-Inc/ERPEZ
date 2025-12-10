using ERPEZ.Application.Common.Queries;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Queries.GetKPIModeOfVerifications;

public record GetKPIModeOfVerificationsQuery : PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.KPIModeOfVerification>>
{
}
