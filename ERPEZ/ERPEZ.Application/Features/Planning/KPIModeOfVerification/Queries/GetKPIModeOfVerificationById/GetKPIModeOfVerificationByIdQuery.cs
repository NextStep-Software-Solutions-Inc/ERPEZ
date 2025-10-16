using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Queries.GetKPIModeOfVerificationById;

public record class GetKPIModeOfVerificationByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.KPIModeOfVerification>>;