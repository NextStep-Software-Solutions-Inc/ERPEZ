namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;

/// <summary>
/// Aggregated status counts and summary metrics for the Notice to Proceed workspace.
/// </summary>
public record NoticeToProceedSummaryDto
{
    public int TotalCount { get; init; }
    public int DraftCount { get; init; }
    public int IssuedCount { get; init; }
    public int ReceivedCount { get; init; }
    public int CancelledCount { get; init; }
    public decimal TotalAwardedAmount { get; init; }
}
