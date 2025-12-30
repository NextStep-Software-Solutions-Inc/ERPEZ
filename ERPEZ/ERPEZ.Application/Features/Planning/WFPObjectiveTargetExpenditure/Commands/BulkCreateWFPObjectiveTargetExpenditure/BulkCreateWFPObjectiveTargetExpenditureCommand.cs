using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Commands.BulkCreateWFPObjectiveTargetExpenditure;

public class BulkCreateWFPObjectiveTargetExpenditureCommand : IRequest<ApiResponse<Unit>>
{
    public Guid WFPObjectiveTargetId { get; set; }
    public required List<CreateWFPObjectiveTargetExpenditureRequest> Expenditures { get; set; }
}
