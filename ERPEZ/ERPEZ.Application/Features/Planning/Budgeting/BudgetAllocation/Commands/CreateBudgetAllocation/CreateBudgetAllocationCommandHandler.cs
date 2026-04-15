using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Commands.CreateBudgetAllocation;

public class CreateBudgetAllocationCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateBudgetAllocationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateBudgetAllocationCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        _ = await unitOfWork.LineItemBudgetDetailRepository.GetByIdAsync(request.LineItemBudgetDetailId, cancellationToken)
            ?? throw new NotFoundException($"Line Item Budget Detail with ID {request.LineItemBudgetDetailId} not found.");

        var entity = new Domain.Entities.Planning.BudgetAllocation
        {
            LineItemBudgetDetailId = request.LineItemBudgetDetailId,
            BudgetPeriod = request.BudgetPeriod,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TotalAllocated = request.TotalAllocated
        };

        await unitOfWork.BudgetAllocationRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Budget Allocation created successfully.");
    }
}
