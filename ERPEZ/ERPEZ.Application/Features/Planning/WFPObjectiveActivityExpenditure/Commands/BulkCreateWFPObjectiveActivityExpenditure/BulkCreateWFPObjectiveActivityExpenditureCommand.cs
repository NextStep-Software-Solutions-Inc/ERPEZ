using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Commands.BulkCreateWFPObjectiveActivityExpenditure;

public class BulkCreateWFPObjectiveActivityExpenditureCommand : IRequest<ApiResponse<Unit>>
{
    public Guid WFPObjectiveActivityId { get; set; }
    public required List<CreateWFPObjectiveActivityExpenditureRequest> Expenditures { get; set; }
}
