using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Queries.GetKPIModeOfVerificationById;

public record GetKPIModeOfVerificationByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.KPIModeOfVerification>>;
