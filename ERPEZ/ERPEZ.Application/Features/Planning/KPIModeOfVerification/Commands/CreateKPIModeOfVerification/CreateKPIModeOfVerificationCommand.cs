using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Commands.CreateKPIModeOfVerification;

public class CreateKPIModeOfVerificationCommand : IRequest<ApiResponse<Guid>>
{
    public Guid KPIId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? FileId { get; set; }
}
