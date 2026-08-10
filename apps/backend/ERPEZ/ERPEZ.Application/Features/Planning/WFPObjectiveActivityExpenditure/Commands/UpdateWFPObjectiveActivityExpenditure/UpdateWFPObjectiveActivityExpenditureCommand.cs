using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Commands.UpdateWFPObjectiveActivityExpenditure;

public class UpdateWFPObjectiveActivityExpenditureCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateWFPObjectiveActivityExpenditureRequest UpdateWFPObjectiveActivityExpenditure { get; set; }
}

