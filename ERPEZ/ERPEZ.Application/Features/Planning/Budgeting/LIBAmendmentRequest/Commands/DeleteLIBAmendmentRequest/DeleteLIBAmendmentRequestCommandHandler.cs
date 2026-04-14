using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.DeleteLIBAmendmentRequest;

public class DeleteLIBAmendmentRequestCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteLIBAmendmentRequestCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteLIBAmendmentRequestCommand command, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LIBAmendmentRequestRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB Amendment Request with ID {command.Id} not found.");

        unitOfWork.LIBAmendmentRequestRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "LIB Amendment Request deleted successfully.");
    }
}

