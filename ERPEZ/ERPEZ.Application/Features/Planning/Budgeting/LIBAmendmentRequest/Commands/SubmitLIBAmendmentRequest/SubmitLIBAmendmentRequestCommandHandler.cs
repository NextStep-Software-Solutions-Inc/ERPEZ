using ERPEZ.Domain.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.SubmitLIBAmendmentRequest;

public class SubmitLIBAmendmentRequestCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<SubmitLIBAmendmentRequestCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(SubmitLIBAmendmentRequestCommand command, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LIBAmendmentRequestRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB Amendment Request with ID {command.Id} not found.");

        if (!entity.Status.Equals("Draft", StringComparison.OrdinalIgnoreCase))
            throw new ValidationException("Only Draft amendment requests can be submitted.");

        // Fetch the Draft clone first before using it
        var proposedLIB = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(
            entity.ProposedLineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"Proposed LIB with ID {entity.ProposedLineItemBudgetId} not found.");

        // Flip both statuses — keeps amendment request and clone LIB in sync
        entity.Status = "Submitted";
        proposedLIB.Status = LIBStatus.Submitted.ToString();

        unitOfWork.LIBAmendmentRequestRepository.Update(entity);
        unitOfWork.LineItemBudgetRepository.Update(proposedLIB);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "LIB Amendment Request submitted successfully.");
    }
}