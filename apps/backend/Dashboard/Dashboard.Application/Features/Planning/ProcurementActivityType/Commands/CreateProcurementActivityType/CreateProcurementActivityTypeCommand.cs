using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementActivityType.Commands.CreateProcurementActivityType;

public record CreateProcurementActivityTypeCommand : IRequest<ApiResponse<Guid>>
{
    public string Name { get; init; } = string.Empty;
    public string ActivityCode { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int? MinDays { get; init; }
    public int? MaxDays { get; init; }
}
