namespace ERPEZ.Application.Features.Planning.ItemRequest.Dtos;

public record UpdateItemRequestRequest
{
    public string? Name { get; init; }
    public string? ItemCategory { get; init; }
    public string? Status { get; init; }
    public decimal? EstimatedUnitCost { get; init; }
    public Guid? UOMId { get; init; }
    public Guid? ProcurementCategoryId { get; init; }
    public string? TechnicalSpecification { get; init; }
    public string? TWGRemarks { get; init; }
    public string? UACSCode { get; init; }
    public string? UNSCPSCCode { get; init; }
}
