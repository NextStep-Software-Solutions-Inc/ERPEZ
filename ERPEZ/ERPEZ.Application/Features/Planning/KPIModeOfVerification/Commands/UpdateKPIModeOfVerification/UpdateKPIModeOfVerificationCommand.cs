using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Commands.UpdateKPIModeOfVerification;

public class UpdateKPIModeOfVerificationCommand : IRequest<ApiResponse<Domain.Entities.Planning.KPIModeOfVerification>>
{
    public Guid Id { get; set; }
    public required UpdateKPIModeOfVerificationDto UpdateKPIModeOfVerification { get; set; }
}

