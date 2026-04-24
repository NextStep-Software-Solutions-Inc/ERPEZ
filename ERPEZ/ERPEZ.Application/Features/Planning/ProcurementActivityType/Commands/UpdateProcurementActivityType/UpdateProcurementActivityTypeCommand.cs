using ERPEZ.Shared.Common;
using MediatR;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.ProcurementActivityType.Commands.UpdateProcurementActivityType;

public record UpdateProcurementActivityTypeCommand : IRequest<ApiResponse<Unit>>
{
    [JsonIgnore]
    public Guid Id { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public int? MinDays { get; init; }
    public int? MaxDays { get; init; }
    public bool? IsActive { get; init; }
}
