using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Commands.DeleteBudgetAllocation;

public class DeleteBudgetAllocationCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteBudgetAllocationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteBudgetAllocationCommand command, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.BudgetAllocationRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"Budget Allocation with ID {command.Id} not found.");

        unitOfWork.BudgetAllocationRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Budget Allocation deleted successfully.");
    }
}
