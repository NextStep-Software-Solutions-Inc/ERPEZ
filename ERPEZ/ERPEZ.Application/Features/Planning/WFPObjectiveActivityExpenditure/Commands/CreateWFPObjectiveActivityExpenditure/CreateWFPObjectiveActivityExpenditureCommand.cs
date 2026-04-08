using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Commands.CreateWFPObjectiveActivityExpenditure;

public class CreateWFPObjectiveActivityExpenditureCommand : IRequest<ApiResponse<Guid>>
{
    public Guid WFPObjectiveActivityId { get; set; }
    public Guid ObjectId { get; set; }
    public string ItemDescription { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
}
