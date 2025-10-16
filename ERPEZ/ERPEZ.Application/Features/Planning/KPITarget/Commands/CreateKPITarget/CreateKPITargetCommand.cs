using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPITarget.Commands.CreateKPITarget;

public class CreateKPITargetCommand : IRequest<ApiResponse<Domain.Entities.Planning.KPITarget>>
{
    public Guid KPIId { get; set; }
    public decimal TargetValue { get; set; }
    public string Period { get; set; } = string.Empty;
    public string? QuarterName { get; set; }
}
