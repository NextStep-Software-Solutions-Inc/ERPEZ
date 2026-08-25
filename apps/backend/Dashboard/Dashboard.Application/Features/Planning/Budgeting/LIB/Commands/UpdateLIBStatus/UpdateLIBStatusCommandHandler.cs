using ERPEZ.Application.Features.Planning.LineItemBudget.Validators;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.UpdateLIBStatus;

public class UpdateLIBStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateLIBStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateLIBStatusCommand command, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LineItemBudgetRepository.GetByIdWithDetailsAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {command.Id} not found.");

        var targetStatus = command.Status.Trim();

        // 1. Submit transition
        if (targetStatus.Equals(nameof(LIBStatus.Submitted), StringComparison.OrdinalIgnoreCase))
        {
            var isSubmittableState = entity.Status.Equals(nameof(LIBStatus.Draft), StringComparison.OrdinalIgnoreCase) ||
                                     entity.Status.Equals(nameof(LIBStatus.Returned), StringComparison.OrdinalIgnoreCase) ||
                                     entity.Status.Equals(nameof(LIBStatus.Proposed), StringComparison.OrdinalIgnoreCase);

            if (!isSubmittableState)
            {
                throw new ValidationException($"Cannot submit LIB with status '{entity.Status}'. Only Draft, Returned, or Proposed LIBs can be submitted.");
            }

            var (isValid, errors, _) = LineItemBudgetValidationRules.ValidateSubmissionCompleteness(entity);
            if (!isValid)
            {
                throw new ValidationException($"Cannot submit incomplete LIB: {string.Join("; ", errors)}");
            }

            entity.Status = nameof(LIBStatus.Submitted);
            entity.SubmittedDate = DateTime.UtcNow;
        }
        // 2. Approve transition
        else if (targetStatus.Equals(nameof(LIBStatus.Approved), StringComparison.OrdinalIgnoreCase))
        {
            if (!entity.Status.Equals(nameof(LIBStatus.Submitted), StringComparison.OrdinalIgnoreCase))
            {
                throw new ValidationException($"Cannot approve LIB with status '{entity.Status}'. Only Submitted LIBs can be approved.");
            }

            entity.Status = nameof(LIBStatus.Approved);
            entity.ApprovedDate = DateTime.UtcNow;
        }
        // 3. Return / Reject transition
        else if (targetStatus.Equals(nameof(LIBStatus.Returned), StringComparison.OrdinalIgnoreCase) ||
                 targetStatus.Equals("Rejected", StringComparison.OrdinalIgnoreCase))
        {
            if (!entity.Status.Equals(nameof(LIBStatus.Submitted), StringComparison.OrdinalIgnoreCase))
            {
                throw new ValidationException($"Cannot return LIB with status '{entity.Status}'. Only Submitted LIBs can be returned.");
            }

            entity.Status = nameof(LIBStatus.Returned);
            entity.ApprovedDate = null;
        }
        // 4. Other valid transitions
        else
        {
            entity.Status = targetStatus;
        }

        unitOfWork.LineItemBudgetRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"LIB status updated to {entity.Status} successfully.");
    }
}
