using ERPEZ.Application.Features.Planning.BudgetCall.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Queries.GetBudgetCallById;

public class GetBudgetCallByIdHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetBudgetCallByIdQuery, ApiResponse<BudgetCallDetailedResponse>>
{
    public async Task<ApiResponse<BudgetCallDetailedResponse>> Handle(
        GetBudgetCallByIdQuery request,
        CancellationToken cancellationToken)
    {
        var budgetCall = await unitOfWork.BudgetCallRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("Budget call not found.");

        var response = new BudgetCallDetailedResponse
        {
            Id = budgetCall.Id,
            FiscalYearId = budgetCall.FiscalYearId,
            Type = budgetCall.Type,
            SubmissionDeadline = budgetCall.SubmissionDeadline,
            Status = budgetCall.Status,
            CreatedAt = budgetCall.CreatedAt,
            CreatedBy = budgetCall.CreatedBy,
            UpdatedAt = budgetCall.UpdatedAt,
            UpdatedBy = budgetCall.UpdatedBy
        };

        return ApiResponse<BudgetCallDetailedResponse>.Success(response, "Retrieved successfully");
    }
}
