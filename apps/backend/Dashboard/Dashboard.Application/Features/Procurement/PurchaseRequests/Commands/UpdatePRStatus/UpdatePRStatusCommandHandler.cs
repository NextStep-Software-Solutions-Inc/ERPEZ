using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.UpdatePRStatus;

public class UpdatePRStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdatePRStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdatePRStatusCommand command, CancellationToken cancellationToken)
    {
        var pr = await unitOfWork.PurchaseRequestRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"Purchase Request with ID {command.Id} not found.");

        pr.Status = command.Status;

        unitOfWork.PurchaseRequestRepository.Update(pr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Purchase Request status updated successfully.");
    }
}