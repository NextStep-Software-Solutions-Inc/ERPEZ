using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.ReturnLIBAmendmentRequest;

public class ReturnLIBAmendmentRequestCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ReturnLIBAmendmentRequestCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ReturnLIBAmendmentRequestCommand command, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LIBAmendmentRequestRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB Amendment Request with ID {command.Id} not found.");

        if (!entity.Status.Equals(LIBAmendmentStatus.Submitted.ToString(), StringComparison.OrdinalIgnoreCase))
            throw new ValidationException("Only Submitted amendment requests can be returned.");

        var proposedLIB = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(
            entity.ProposedLineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"Proposed LIB with ID {entity.ProposedLineItemBudgetId} not found.");

        entity.Status = LIBAmendmentStatus.Returned.ToString();
        entity.Remarks = command.Request.Remarks;
        
        proposedLIB.Status = LIBStatus.Returned.ToString();

        unitOfWork.LIBAmendmentRequestRepository.Update(entity);
        unitOfWork.LineItemBudgetRepository.Update(proposedLIB);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "LIB Amendment Request returned successfully.");
    }
}
