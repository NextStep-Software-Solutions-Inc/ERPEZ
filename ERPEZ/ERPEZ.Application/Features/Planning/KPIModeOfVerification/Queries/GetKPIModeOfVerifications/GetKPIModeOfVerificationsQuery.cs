using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Queries.GetKPIModeOfVerifications;

public record GetKPIModeOfVerificationsQuery : PaginatedQuery<PaginatedApiResponse<KPIModeOfVerificationResponse>>
{
}
