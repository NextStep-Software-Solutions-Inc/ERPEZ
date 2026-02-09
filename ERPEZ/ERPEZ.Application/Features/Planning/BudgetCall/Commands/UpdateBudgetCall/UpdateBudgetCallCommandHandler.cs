using ERPEZ.Application.Features.Planning.BudgetCall.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Commands.UpdateBudgetCall;

public sealed class UpdateBudgetCallCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateBudgetCallCommand, ApiResponse<BudgetCallResponse>>
{
    public async Task<ApiResponse<BudgetCallResponse>> Handle(UpdateBudgetCallCommand request, CancellationToken cancellationToken)
    {
        var budgetCall = await unitOfWork.BudgetCallRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Budget call not found.");

        var dto = request.UpdateBudgetCall;

        budgetCall.Type = dto.Type;
        budgetCall.SubmissionDeadline = dto.SubmissionDeadline;

        unitOfWork.BudgetCallRepository.Update(budgetCall);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new BudgetCallResponse
        {
            Id = budgetCall.Id,
            FiscalYearId = budgetCall.FiscalYearId,
            Type = budgetCall.Type,
            SubmissionDeadline = budgetCall.SubmissionDeadline,
            CreatedAt = budgetCall.CreatedAt
        };

        return ApiResponse<BudgetCallResponse>.Success(response, "Budget call updated successfully.");
    }
}
