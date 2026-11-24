using ERPEZ.Application.Features.Planning.BudgetCall.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Commands.UpdateBudgetCall;

public class UpdateBudgetCallCommand : IRequest<ApiResponse<BudgetCallResponse>>
{
    public Guid Id { get; set; }
    public required UpdateBudgetCallRequest UpdateBudgetCall { get; set; }
}
