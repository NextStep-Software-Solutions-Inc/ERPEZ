using ERPEZ.Shared.Common;
using MediatR;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.ProcurementCategory.Commands.UpdateProcurementCategory;

public record UpdateProcurementCategoryCommand : IRequest<ApiResponse<Unit>>
{
    [JsonIgnore]
    public Guid Id { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
}
