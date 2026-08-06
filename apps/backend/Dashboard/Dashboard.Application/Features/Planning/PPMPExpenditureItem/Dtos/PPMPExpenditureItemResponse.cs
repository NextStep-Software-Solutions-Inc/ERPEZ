namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Dtos;

public record PPMPExpenditureItemResponse
{
    public Guid Id { get; init; }
    public Guid PPMPId { get; init; }
    public Guid? PPMPActivityId { get; init; }
    public Guid? LineItemBudgetDetailId { get; init; }
    public bool IsProcurable { get; init; }
    public decimal TotalCost { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public string? PPMPActivityName { get; init; }
}