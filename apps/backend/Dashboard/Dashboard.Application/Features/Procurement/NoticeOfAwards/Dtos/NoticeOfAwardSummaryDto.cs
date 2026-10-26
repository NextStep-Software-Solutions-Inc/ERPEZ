namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;

public record NoticeOfAwardSummaryDto
{
    public int Draft { get; init; }
    public int ForApproval { get; init; }
    public int Returned { get; init; }
    public int Approved { get; init; }
    public int OpenSla { get; init; }
    public int OverdueSla { get; init; }
    public decimal RunningTotal { get; init; }
}
