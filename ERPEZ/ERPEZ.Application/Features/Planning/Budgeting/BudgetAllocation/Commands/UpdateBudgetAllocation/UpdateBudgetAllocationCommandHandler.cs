using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Commands.UpdateBudgetAllocation;

public class UpdateBudgetAllocationCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateBudgetAllocationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateBudgetAllocationCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var entity = await unitOfWork.BudgetAllocationRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"Budget Allocation with ID {command.Id} not found.");

        _ = await unitOfWork.LineItemBudgetDetailRepository.GetByIdAsync(request.LineItemBudgetDetailId, cancellationToken)
            ?? throw new NotFoundException($"Line Item Budget Detail with ID {request.LineItemBudgetDetailId} not found.");

        entity.LineItemBudgetDetailId = request.LineItemBudgetDetailId;
        entity.BudgetPeriod = request.BudgetPeriod;
        entity.StartDate = request.StartDate;
        entity.EndDate = request.EndDate;
        entity.TotalAllocated = request.TotalAllocated;

        unitOfWork.BudgetAllocationRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Budget Allocation updated successfully.");
    }
}
