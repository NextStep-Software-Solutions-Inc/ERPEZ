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
        // Links can be matched by PPMPId OR by junction record Id
        var linkedPPMPIds = existingLinks.Select(ap => ap.PPMPId).ToHashSet();
        var linkedJunctionIds = existingLinks.Select(ap => ap.Id).ToHashSet();
        var notLinkedIds = ppmpIds
            .Where(id => !linkedPPMPIds.Contains(id) && !linkedJunctionIds.Contains(id))
            .ToList();

        if (notLinkedIds.Any())
        {
            throw new NotFoundException($"The following PPMPs are not linked to this APP: {string.Join(", ", notLinkedIds)}");
        }

        // Remove the links and associated APPItems (soft-delete)
        if (existingLinks.Any())
        {
            var activeLinks = existingLinks.Where(l => !l.IsDeleted).ToList();
            if (activeLinks.Any())
            {
                unitOfWork.APPPPMPRepository.RemoveRange(activeLinks);
            }

            // Also remove any APPItems in this APP that originated from the unselected PPMPs
            var targetPpmpIds = existingLinks.Select(link => link.PPMPId).ToHashSet();
            // Using GetAPPItemsByPPMPIdsAsync with IgnoreQueryFilters is required here because 
            // if an APPItem was previously soft-deleted, we still need to retrieve it to ensure 
            // no orphaned tracking states cause DbUpdateConcurrencyException, or simply to skip it
            // if we are soft-deleting. Wait, if we are soft deleting, we should only delete the active ones!
            var itemsToRemove = await unitOfWork.APPItemRepository.GetAPPItemsByPPMPIdsAsync(request.APPId, targetPpmpIds, cancellationToken);
            var activeItemsToRemove = itemsToRemove.Where(i => !i.IsDeleted).ToList();

            foreach (var item in activeItemsToRemove)
            {
                unitOfWork.APPItemRepository.Remove(item);
            }

            try
            {
                await unitOfWork.SaveChangesAsync(cancellationToken);
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException ex)
            {
                var details = string.Join("; ", ex.Entries.Select(e => $"Entity: {e.Entity.GetType().Name}, State: {e.State}, ID: {(e.Entity as ERPEZ.Domain.Common.BaseEntity)?.Id}"));
                throw new System.InvalidOperationException($"Save failed during PPMP removal (Concurrency): {ex.Message}. Tracked entries: {details}", ex);
            }
            catch (System.Exception ex)
            {
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                throw new System.InvalidOperationException($"Save failed during PPMP removal: {innerMessage}. Stack: {ex.StackTrace}", ex);
            }
        }

        return ApiResponse<Unit>.Success(Unit.Value, $"{existingLinks.Count} PPMPs unselected successfully.");
    }
}
