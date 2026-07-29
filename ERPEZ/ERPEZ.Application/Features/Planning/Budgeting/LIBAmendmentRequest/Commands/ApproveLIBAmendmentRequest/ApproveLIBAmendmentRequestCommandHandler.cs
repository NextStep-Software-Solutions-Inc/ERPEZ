using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.ApproveLIBAmendmentRequest;

public class ApproveLIBAmendmentRequestCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ApproveLIBAmendmentRequestCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ApproveLIBAmendmentRequestCommand command, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LIBAmendmentRequestRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB Amendment Request with ID {command.Id} not found.");

        if (!entity.Status.Equals(LIBAmendmentStatus.Submitted.ToString(), StringComparison.OrdinalIgnoreCase))
            throw new ValidationException("Only Submitted amendment requests can be approved.");

        var proposedLIB = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(
            entity.ProposedLineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"Proposed LIB with ID {entity.ProposedLineItemBudgetId} not found.");

        var originalLIB = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(
            entity.LineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"Original LIB with ID {entity.LineItemBudgetId} not found.");

        // Flip all three atomically
        entity.Status = LIBAmendmentStatus.Approved.ToString();
        proposedLIB.Status = LIBStatus.Approved.ToString();
        originalLIB.Status = LIBStatus.Amended.ToString(); 

        unitOfWork.LIBAmendmentRequestRepository.Update(entity);
        unitOfWork.LineItemBudgetRepository.Update(proposedLIB);
        unitOfWork.LineItemBudgetRepository.Update(originalLIB);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "LIB Amendment Request approved successfully.");
    }
}
