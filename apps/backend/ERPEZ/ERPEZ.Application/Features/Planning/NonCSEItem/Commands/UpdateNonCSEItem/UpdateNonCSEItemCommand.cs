using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Commands.UpdateNonCSEItem;

public record UpdateNonCSEItemCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public Guid? UOMId { get; init; }
    public Guid? ItemRequestId { get; init; }
    public string? ProductCode { get; init; }
    public decimal? CurrentPrice { get; init; }
    public string? Remarks { get; init; }
    public bool? IsActive { get; init; }
}
