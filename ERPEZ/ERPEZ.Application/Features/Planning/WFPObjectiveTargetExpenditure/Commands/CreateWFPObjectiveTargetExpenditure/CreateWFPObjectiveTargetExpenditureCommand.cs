using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Commands.CreateWFPObjectiveTargetExpenditure;

public class CreateWFPObjectiveTargetExpenditureCommand : IRequest<ApiResponse<Guid>>
{
    public Guid WFPObjectiveTargetId { get; set; }
    public Guid ObjectId { get; set; }
    public string ItemDescription { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal CostEstimates { get; set; }
}
