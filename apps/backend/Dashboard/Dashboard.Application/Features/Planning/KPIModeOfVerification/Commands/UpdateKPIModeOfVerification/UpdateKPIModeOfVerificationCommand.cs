using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Commands.UpdateKPIModeOfVerification;

public class UpdateKPIModeOfVerificationCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateKPIModeOfVerificationRequest UpdateKPIModeOfVerification { get; set; }
}

