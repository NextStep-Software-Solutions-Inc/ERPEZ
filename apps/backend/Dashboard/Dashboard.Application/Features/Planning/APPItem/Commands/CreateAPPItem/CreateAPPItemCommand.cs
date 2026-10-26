using ERPEZ.Shared.Common;
using ERPEZ.Domain.Enums;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItem.Commands.CreateAPPItem;

public class CreateAPPItemCommand : IRequest<ApiResponse<Guid>>
{
    public Guid APPId { get; set; }
    public Guid PPMPItemId { get; set; }
    public Guid ProcurementModeId { get; set; }
    public Guid FundSourceId { get; set; }
    public Guid OfficeId { get; set; }
    public string PAPCode { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public string? ItemNameOverride { get; set; }
    public string? GeneralDescription { get; set; }
    public bool IsEarlyProcurementActivity { get; set; }
    public string? EPARemarks { get; set; }
    public bool IsOutsourced { get; set; }
    public string? BidEvaluationCriteria { get; set; }
    public List<string>? ProcurementStrategies { get; set; }
    public DateTime? StartOfProcurementOverride { get; set; }
    public DateTime? EndOfProcurementOverride { get; set; }
    public decimal? EstimatedBudgetOverride { get; set; }
}
