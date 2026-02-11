using ERPEZ.Shared.Common;
using MediatR;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.ProcurementItem.Commands.UpdateProcurementItem;

public record UpdateProcurementItemCommand : IRequest<ApiResponse<Unit>>
{
    [JsonIgnore]
    public Guid Id { get; init; }
    public string? Name { get; init; }
    public string? Specifications { get; init; }
    public string? Type { get; init; }
    public bool? IsCSE { get; init; }
    public int? ItemLife { get; init; }
    public string? ProductCode { get; init; }
    public string? ImageURL { get; init; }
    public bool? IsActive { get; init; }
    public Guid? ObjectCodeId { get; init; }
    public Guid? UNSPSCCodeId { get; init; }
    public Guid? UOMId { get; init; }
}
