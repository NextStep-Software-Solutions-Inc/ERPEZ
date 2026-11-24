using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Commands.ChangeBudgetCallStatus;

public sealed class ChangeBudgetCallStatusCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<ChangeBudgetCallStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ChangeBudgetCallStatusCommand request, CancellationToken cancellationToken)
    {
        var budgetCall = await unitOfWork.BudgetCallRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) 
            ?? throw new NotFoundException("Budget call not found.");

        // Parse and validate using enum (validation ensures this will succeed)
        var currentStatusEnum = Enum.Parse<BudgetCallStatusEnum>(budgetCall.Status, ignoreCase: true);
        var newStatusEnum = Enum.Parse<BudgetCallStatusEnum>(request.Status, ignoreCase: true);

        // Validate status transition
        if (!IsValidTransition(currentStatusEnum, newStatusEnum))
        {
            throw new ConflictException($"Cannot change status from {currentStatusEnum} to {newStatusEnum}.");
        }

        budgetCall.Status = newStatusEnum.ToString();

        unitOfWork.BudgetCallRepository.Update(budgetCall);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Budget call status updated successfully.");
    }

    private static bool IsValidTransition(BudgetCallStatusEnum currentStatus, BudgetCallStatusEnum newStatus)
    {
        // Same status is allowed (idempotent)
        if (currentStatus == newStatus)
            return true;

        // Define valid transitions
        return (currentStatus, newStatus) switch
        {
            (BudgetCallStatusEnum.Draft, BudgetCallStatusEnum.Active) => true,
            (BudgetCallStatusEnum.Active, BudgetCallStatusEnum.Closed) => true,
            (BudgetCallStatusEnum.Draft, BudgetCallStatusEnum.Closed) => true, // Allow direct close from draft
            _ => false // All other transitions are invalid
        };
    }
}
