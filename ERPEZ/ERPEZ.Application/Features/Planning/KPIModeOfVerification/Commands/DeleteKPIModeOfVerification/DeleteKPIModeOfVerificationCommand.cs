using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Commands.DeleteKPIModeOfVerification;

public record DeleteKPIModeOfVerificationCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
