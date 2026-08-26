using ERPEZ.Shared.Common;
using MediatR;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.UOM.Commands.UpdateUOM;

public record UpdateUOMCommand : IRequest<ApiResponse<Unit>>
{
    [JsonIgnore]
    public Guid Id { get; init; }
    public string? Name { get; init; }
    public string? Code { get; init; }
    public decimal? ConversionFactor { get; init; }
    public Guid? ParentId { get; init; }
}
