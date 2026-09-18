using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.UnlinkRFQ;

public class UnlinkRFQCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UnlinkRFQCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UnlinkRFQCommand request, CancellationToken cancellationToken)
    {
        var aob = await unitOfWork.AOBRepository.Query()
            .Include(a => a.AOBRFQMappings)
            .Include(a => a.AOBAwardedItems)
            .FirstOrDefaultAsync(a => a.Id == request.AOBId && !a.IsDeleted, cancellationToken);

        if (aob == null)
        {
            return ApiResponse<Unit>.Fail("Abstract of Bids (AOB) not found.");
        }

        if (aob.Status != StatusEnum.Draft && aob.Status != StatusEnum.Returned)
        {
            return ApiResponse<Unit>.Fail($"Cannot unlink RFQ from an AOB in status '{aob.Status}'. Only Draft or Returned AOBs can be modified.");
        }

        var mapping = aob.AOBRFQMappings.FirstOrDefault(m => m.RFQId == request.RFQId);
        if (mapping == null)
        {
            return ApiResponse<Unit>.Fail("The specified RFQ is not linked to this AOB.");
        }

        // Find any items belonging to this RFQ to clean up awarded items if any
        var rfq = await unitOfWork.RFQRepository.Query()
            .Include(r => r.RFQItems)
            .FirstOrDefaultAsync(r => r.Id == request.RFQId, cancellationToken);

        if (rfq != null)
        {
            var rfqItemIds = rfq.RFQItems.Select(i => i.Id).ToHashSet();
            var awardedToRemove = aob.AOBAwardedItems
                .Where(ai => rfqItemIds.Contains(ai.RFQItemId))
                .ToList();

            foreach (var ai in awardedToRemove)
            {
                aob.AOBAwardedItems.Remove(ai);
                unitOfWork.AOBAwardedItemRepository.Remove(ai, hardDelete: true);
            }
        }

        aob.AOBRFQMappings.Remove(mapping);
        unitOfWork.AOBRFQMappingRepository.Remove(mapping, hardDelete: true);

        aob.UpdatedAt = DateTime.UtcNow;
        aob.UpdatedBy = "System";

        unitOfWork.AOBRepository.Update(aob);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "RFQ unlinked successfully from AOB.");
    }
}
