using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;

public record CreateKPICommand : IRequest<ApiResponse<KPIResponse>>
{
    public Guid? ParentKPIId { get; init; }
    public string FunctionType { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; } = string.Empty;
    public bool IsOfficeMandate { get; init; } = false;
    public bool IsPercentage { get; init; } = false;
    public bool IsTargetValueAllocable { get; init; } = false;
}
