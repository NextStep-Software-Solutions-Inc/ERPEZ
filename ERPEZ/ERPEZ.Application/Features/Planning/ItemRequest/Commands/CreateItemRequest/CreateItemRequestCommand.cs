using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemRequest.Commands.CreateItemRequest;

public record CreateItemRequestCommand : IRequest<ApiResponse<Guid>>
{
    public Guid OfficeId { get; init; }
    public Guid? UOMId { get; init; }
    public Guid? ProcurementCategoryId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string ItemCategory { get; init; } = string.Empty;
    public string Status { get; init; } = "Draft";
    public decimal EstimatedUnitCost { get; init; }
    public string? TechnicalSpecification { get; init; }
    public string? TWGRemarks { get; init; }
    public string? UACSCode { get; init; }
    public string? UNSCPSCCode { get; init; }
}
