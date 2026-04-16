using ERPEZ.Domain.Interfaces;
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

        entity.Status = "Submitted";

        unitOfWork.LIBAmendmentRequestRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "LIB Amendment Request submitted successfully.");
    }
}
