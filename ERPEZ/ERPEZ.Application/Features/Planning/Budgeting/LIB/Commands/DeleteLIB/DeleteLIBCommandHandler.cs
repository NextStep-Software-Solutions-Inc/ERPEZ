using ERPEZ.Domain.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.DeleteLIB;

public class DeleteLIBCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteLIBCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteLIBCommand command, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {command.Id} not found.");

        // Guard: Approved LIBs are immutable — they can only be changed
        // via an amendment request, never deleted directly.
        if (entity.Status.Equals("Approved", StringComparison.OrdinalIgnoreCase))
            throw new ValidationException("Approved LIBs cannot be deleted. Create an amendment instead.");

        // If this LIB is a Draft clone created by an amendment request,
        // mark that amendment as Cancelled instead of deleting it.
        // This preserves the audit trail (who requested it, reason, justification)
        // while releasing the FK reference on ProposedLineItemBudgetId.
        var amendmentRequest = await unitOfWork.LIBAmendmentRequestRepository.FindAsync(
            ar => ar.ProposedLineItemBudgetId == command.Id, cancellationToken);

        if (amendmentRequest is not null)
            amendmentRequest.Status = LIBAmendmentStatus.Cancelled.ToString(); 
        
        // Remove the LIB — EF Core cascade deletes all children at DB level:
        // LineItemBudgetActivities, LineItemBudgetDetails, timelines, etc.
        // No manual loops needed here; configure OnDelete(DeleteBehavior.Cascade)
        // in your entity configurations if not already done.
        unitOfWork.LineItemBudgetRepository.Remove(entity);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "LIB deleted successfully.");
    }
}

