using ERPEZ.Shared.Common;
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
    public bool IsEarlyProcurementActivity { get; set; }
    public bool IsOutsourced { get; set; }
    public List<string>? BidEvaluationCriteria { get; set; }
    public string? ProcurementStrategy { get; set; }
}
