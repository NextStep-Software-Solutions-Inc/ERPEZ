using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Commands.UpdateBudgetCall;

public sealed class UpdateBudgetCallCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateBudgetCallCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateBudgetCallCommand request, CancellationToken cancellationToken)
    {
        var budgetCall = await unitOfWork.BudgetCallRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Budget call not found.");

        var dto = request.UpdateBudgetCall;

        budgetCall.Type = dto.Type;
        budgetCall.SubmissionDeadline = dto.SubmissionDeadline;

        unitOfWork.BudgetCallRepository.Update(budgetCall);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Budget call updated successfully.");
    }
}
