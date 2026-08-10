namespace ERPEZ.Application.Features.Planning.PPMPItem.Dtos;

public record UpdatePPMPItemRequest
{
    public Guid? PPMPExpenditureItemId { get; init; }
    public Guid? CSEItemId { get; init; }
    public Guid? NonCSEItemId { get; init; }
    public Guid? ProcurementModeId { get; init; }
    public string? PAPCode { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public string? Unit { get; init; }
    public decimal? UnitPrice { get; init; }
    public bool? MOPOverride { get; init; }
    public string? MOPJustification { get; init; }
}
