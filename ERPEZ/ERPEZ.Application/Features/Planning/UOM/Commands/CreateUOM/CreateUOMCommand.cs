using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UOM.Commands.CreateUOM;

public record CreateUOMCommand : IRequest<ApiResponse<Guid>>
{
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public decimal? ConversionFactor { get; init; }
    public Guid? ParentId { get; init; }
}
