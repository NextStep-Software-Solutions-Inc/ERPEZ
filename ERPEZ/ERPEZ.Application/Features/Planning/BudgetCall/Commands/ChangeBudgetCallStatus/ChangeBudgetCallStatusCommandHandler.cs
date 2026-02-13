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

        // Validate status transition
        if (!IsValidTransition(budgetCall.Status, request.Status))
        {
            throw new ConflictException($"Cannot change status from {budgetCall.Status} to {request.Status}.");
        }

        budgetCall.Status = request.Status;

        unitOfWork.BudgetCallRepository.Update(budgetCall);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Budget call status updated successfully.");
    }

    private static bool IsValidTransition(string currentStatus, string newStatus)
    {
        // Normalize to handle case-insensitive comparisons
        var current = currentStatus?.Trim();
        var requested = newStatus?.Trim();

        // Same status is allowed (idempotent)
        if (string.Equals(current, requested, StringComparison.OrdinalIgnoreCase))
            return true;

        // Define valid transitions
        return (current, requested) switch
        {
            ("Draft", "Active") => true,
            ("Active", "Closed") => true,
            ("Draft", "Closed") => true, // Allow direct close from draft
            _ => false // All other transitions are invalid
        };
    }
}
