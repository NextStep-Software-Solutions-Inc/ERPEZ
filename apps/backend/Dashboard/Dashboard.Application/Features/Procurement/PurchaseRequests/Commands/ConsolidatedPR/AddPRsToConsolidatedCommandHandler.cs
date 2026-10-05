using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;

public class AddPRsToConsolidatedCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<AddPRsToConsolidatedCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        AddPRsToConsolidatedCommand request, CancellationToken cancellationToken)
    {
        var cpr = await unitOfWork.ConsolidatedPRRepository.GetCPRWithDetailsAsync(
            request.ConsolidatedPRId, cancellationToken)
            ?? throw new NotFoundException(
                $"Consolidated PR with ID {request.ConsolidatedPRId} not found.");

        if (cpr.Status != StatusEnum.Draft)
            throw new ValidationException("Only Draft Consolidated PRs can be modified.");

        decimal addedAmount = 0;

        foreach (var prId in request.Dto.PurchaseRequestIds)
        {
            // Load PR with its items + monthly quantities in one call
            var pr = await unitOfWork.PurchaseRequestRepository.GetPRWithItemsAsync(
                prId, cancellationToken)
                ?? throw new NotFoundException($"Purchase Request with ID {prId} not found.");

            if (pr.Status != StatusEnum.Approved)
                throw new ValidationException(
                    $"Purchase Request '{pr.PRNumber}' is not Approved and cannot be consolidated.");

            foreach (var prItem in pr.PRItems)
            {
                // Skip duplicates using the already-loaded collection — no extra DB call
                var alreadyAdded = cpr.ConsolidatedPRItems
                    .Any(ci => ci.PRItemId == prItem.Id);

                if (alreadyAdded) continue;

                var resolvedModeId = prItem.PPMPItem?.APPItems?
                    .Where(ai => !ai.IsDeleted && (ai.APP == null || !ai.APP.IsDeleted))
                    .OrderByDescending(ai => ai.APP != null && (ai.APP.Status == StatusEnum.Approved || ai.APP.Status == StatusEnum.Active) ? 2 : 1)
                    .ThenByDescending(ai => ai.CreatedAt)
                    .FirstOrDefault()?.ProcurementModeId
                    ?? (prItem.PPMPItem?.ProcurementModeId is Guid pmId && pmId != Guid.Empty ? (Guid?)pmId : null)
                    ?? prItem.APRItem?.APPItem?.ProcurementModeId
                    ?? (prItem.APRItem?.PPMPItem?.ProcurementModeId is Guid aprPmId && aprPmId != Guid.Empty ? (Guid?)aprPmId : null);

                cpr.ConsolidatedPRItems.Add(new ConsolidatedPRItem
                {
                    ConsolidatedPRId  = cpr.Id,
                    PurchaseRequestId = prId,
                    PRItemId          = prItem.Id,
                    AllowPartial      = false,
                    ProcurementModeId = resolvedModeId
                });

                addedAmount += prItem.Amount;
            }
        }

        // Safe: accumulate from source items instead of navigating
        // back through potentially unhydrated ConsolidatedPRItem.PRItem
        cpr.TotalAmount += addedAmount;

        unitOfWork.ConsolidatedPRRepository.Update(cpr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "PRs added to Consolidated PR successfully.");
    }
}