using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Commands.CreateNonCSEItem;

public record CreateNonCSEItemCommand : IRequest<ApiResponse<Guid>>
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid? UOMId { get; init; }
    public Guid? ItemRequestId { get; init; }
    public string? ProductCode { get; init; }
    public decimal CurrentPrice { get; init; }
    public string? Remarks { get; init; }
}
