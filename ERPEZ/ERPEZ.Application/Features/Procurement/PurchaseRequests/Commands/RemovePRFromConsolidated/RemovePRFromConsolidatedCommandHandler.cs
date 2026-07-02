using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR.RemovePRFromConsolidated;

public class RemovePRFromConsolidatedCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<RemovePRFromConsolidatedCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        RemovePRFromConsolidatedCommand request, CancellationToken cancellationToken)
    {
        var cpr = await unitOfWork.ConsolidatedPRRepository.GetCPRWithDetailsAsync(
            request.ConsolidatedPRId, cancellationToken)
            ?? throw new NotFoundException(
                $"Consolidated PR with ID {request.ConsolidatedPRId} not found.");

        if (cpr.Status != StatusEnum.Draft)
            throw new ValidationException("Only Draft Consolidated PRs can be modified.");

        var itemsToRemove = cpr.ConsolidatedPRItems
            .Where(ci => ci.PurchaseRequestId == request.PurchaseRequestId)
            .ToList();

        if (itemsToRemove.Count == 0)
            throw new NotFoundException(
                $"Purchase Request with ID {request.PurchaseRequestId} " +
                $"is not part of this Consolidated PR.");

        var removedAmount = itemsToRemove.Sum(ci => ci.PRItem.Amount);

        foreach (var item in itemsToRemove)
            cpr.ConsolidatedPRItems.Remove(item);

        cpr.TotalAmount -= removedAmount;

        unitOfWork.ConsolidatedPRRepository.Update(cpr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value,
            "Purchase Request removed from Consolidated PR successfully.");
    }
}