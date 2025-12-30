using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Commands.UpdateWFPObjectiveTargetExpenditure;

public class UpdateWFPObjectiveTargetExpenditureCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateWFPObjectiveTargetExpenditureRequest UpdateWFPObjectiveTargetExpenditure { get; set; }
}

