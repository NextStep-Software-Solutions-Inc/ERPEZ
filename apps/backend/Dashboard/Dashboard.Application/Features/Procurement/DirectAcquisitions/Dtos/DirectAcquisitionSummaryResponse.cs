namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;

public class DirectAcquisitionSummaryResponse
{
    public int Total { get; set; }
    public int Draft { get; set; }
    public int PurchaseEntry { get; set; }
    public int ForDisbursement { get; set; }
    public int Approved { get; set; }
    public int Returned { get; set; }
}
