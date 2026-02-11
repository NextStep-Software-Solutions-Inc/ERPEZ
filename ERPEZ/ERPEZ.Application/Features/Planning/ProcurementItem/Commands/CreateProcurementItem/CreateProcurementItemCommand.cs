using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementItem.Commands.CreateProcurementItem;

public record CreateProcurementItemCommand : IRequest<ApiResponse<Guid>>
{
    public string Name { get; init; } = string.Empty;
    public string? Specifications { get; init; }
    public string Type { get; init; } = string.Empty;
    public bool IsCSE { get; init; }
    public int? ItemLife { get; init; }
    public string? ProductCode { get; init; }
    public string? ImageURL { get; init; }
    public Guid ObjectCodeId { get; init; }
    public Guid UNSPSCCodeId { get; init; }
    public Guid UOMId { get; init; }
}
