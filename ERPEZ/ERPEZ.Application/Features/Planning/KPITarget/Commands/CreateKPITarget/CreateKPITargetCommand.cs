using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPITarget.Commands.CreateKPITarget;

public record CreateKPITargetCommand : IRequest<ApiResponse<KPITargetResponse>>
{
    public Guid KPIId { get; init; }
    public decimal TargetValue { get; init; }
    public string Period { get; init; } = string.Empty;
    public string? QuarterName { get; init; }
}
