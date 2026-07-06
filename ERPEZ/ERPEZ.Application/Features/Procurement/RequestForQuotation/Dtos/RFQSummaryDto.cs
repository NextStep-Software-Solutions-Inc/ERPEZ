namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;

public class RFQSummaryDto
{
    public int Total { get; set; }
    public int Draft { get; set; }
    public int Submitted { get; set; }
    public int Approved { get; set; }
    public int Returned { get; set; }
}
