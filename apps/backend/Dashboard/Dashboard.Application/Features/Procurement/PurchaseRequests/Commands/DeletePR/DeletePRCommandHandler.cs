using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.DeletePR;

public class DeletePRCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeletePRCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeletePRCommand request, CancellationToken cancellationToken)
    {
        var pr = await unitOfWork.PurchaseRequestRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Purchase Request with ID {request.Id} not found.");

        if (pr.Status != StatusEnum.Draft)
            throw new ValidationException($"Only Draft Purchase Requests can be deleted. Current status: {pr.Status}.");

        var isConsolidated = await unitOfWork.ConsolidatedPRItemRepository.FindAsync(
            ci => ci.PurchaseRequestId == request.Id, cancellationToken);

        if (isConsolidated is not null)
            throw new ValidationException("Cannot delete a Purchase Request that has been included in a Consolidated PR.");

        pr.IsDeleted = true;
        pr.DeletedAt = DateTime.UtcNow;
        unitOfWork.PurchaseRequestRepository.Update(pr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Purchase Request deleted successfully.");
    }
}