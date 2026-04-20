using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemRequest.Commands.UpdateItemRequest;

public record UpdateItemRequestCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; init; }
    public Guid? UOMId { get; init; }
    public Guid? ProcurementCategoryId { get; init; }
    public string? Name { get; init; }
    public string? ItemCategory { get; init; }
    public string? Status { get; init; }
    public decimal? EstimatedUnitCost { get; init; }
    public string? TechnicalSpecification { get; init; }
    public string? TWGRemarks { get; init; }
    public string? UACSCode { get; init; }
    public string? UNSCPSCCode { get; init; }
}
