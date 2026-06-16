using ERPEZ.Shared.Common;
using ERPEZ.Domain.Enums;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItem.Commands.UpdateAPPItem;

public class UpdateAPPItemCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; set; }
    public Guid APPId { get; set; }
    public Guid PPMPItemId { get; set; }
    public Guid ProcurementModeId { get; set; }
    public Guid FundSourceId { get; set; }
    public Guid OfficeId { get; set; }
    public string PAPCode { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public bool IsEarlyProcurementActivity { get; set; }
    public bool IsOutsourced { get; set; }
    public BidEvaluationCriteria? BidEvaluationCriteria { get; set; }
    public List<ProcurementStrategy>? ProcurementStrategies { get; set; }
}
