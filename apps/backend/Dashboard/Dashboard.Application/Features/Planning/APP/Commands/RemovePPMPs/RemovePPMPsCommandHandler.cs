using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ERPEZ.Application.Features.Planning.APP.Commands.RemovePPMPs;

public class RemovePPMPsCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<RemovePPMPsCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(RemovePPMPsCommand request, CancellationToken cancellationToken)
    {
        // Validate APP exists
        _ = await unitOfWork.APPRepository.GetByIdAsync(request.APPId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        var ppmpIds = request.PPMPIds;

        // Load existing links for the requested PPMPs and APP via repository abstraction
        var existingLinks = await unitOfWork.APPPPMPRepository.GetLinksByAppAndPpmpIdsAsync(request.APPId, ppmpIds, cancellationToken);

        // Check if any requested PPMPIds are not currently linked
        var linkedPPMPIds = existingLinks.Select(ap => ap.PPMPId).ToHashSet();
        var notLinkedIds = ppmpIds.Except(linkedPPMPIds).ToList();

        if (notLinkedIds.Any())
        {
            throw new NotFoundException($"The following PPMPs are not linked to this APP: {string.Join(", ", notLinkedIds)}");
        }

        // Remove the links and associated APPItems
        if (existingLinks.Any())
        {
            unitOfWork.APPPPMPRepository.RemoveRange(existingLinks);

            // Also remove any APPItems in this APP that originated from the unselected PPMPs
            var appItems = await unitOfWork.APPItemRepository.GetAPPItemsWithDetailsAsync(request.APPId, cancellationToken);
            var itemsToRemove = appItems
                .Where(item => item.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMPId != null && 
                               ppmpIds.Contains(item.PPMPItem.PPMPExpenditureItem.PPMPActivity.PPMPId))
                .ToList();

            foreach (var item in itemsToRemove)
            {
                unitOfWork.APPItemRepository.Remove(item);
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return ApiResponse<Unit>.Success(Unit.Value, $"{existingLinks.Count} PPMPs unselected successfully.");
    }
}
