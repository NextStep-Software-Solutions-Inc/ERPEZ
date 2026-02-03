using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Commands.CreateBudgetCall;

public class CreateBudgetCallCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateBudgetCallCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateBudgetCallCommand request, CancellationToken cancellationToken)
    {
        // Verify fiscal year exists
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        var budgetCall = new Domain.Entities.Planning.BudgetCall
        {
            FiscalYearId = request.FiscalYearId,
            Type = request.Type,
            SubmissionDeadline = request.SubmissionDeadline
        };

        await unitOfWork.BudgetCallRepository.AddAsync(budgetCall, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(budgetCall.Id, "Budget call created successfully.");
    }
}
