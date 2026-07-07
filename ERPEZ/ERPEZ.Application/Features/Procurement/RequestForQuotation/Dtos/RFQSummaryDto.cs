namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;

public record RFQSummaryDto
{
    public int Total { get; init; }
    public int Draft { get; init; }
    public int Submitted { get; init; }
    public int Approved { get; init; }
    public int Returned { get; init; }
}
