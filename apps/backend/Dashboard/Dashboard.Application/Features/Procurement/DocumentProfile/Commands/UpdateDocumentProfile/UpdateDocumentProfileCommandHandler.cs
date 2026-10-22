using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DocumentProfile.Commands.UpdateDocumentProfile;

public class UpdateDocumentProfileCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateDocumentProfileCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        UpdateDocumentProfileCommand request, CancellationToken cancellationToken)
    {
        var profile = await unitOfWork.DocumentProfileRepository
                          .GetByIdWithItemsAsync(request.Id, cancellationToken)
                      ?? throw new NotFoundException("Document profile not found.");

        // Prevent duplicate names across other profiles
        var nameConflict = await unitOfWork.DocumentProfileRepository
            .FindAsync(p => p.Name == request.Name && p.Id != request.Id, cancellationToken);
        if (nameConflict != null)
            throw new ConflictException($"A checklist profile named '{request.Name}' already exists.");

        // Deduplicate requested items by MasterDocumentTypeId
        var distinctItems = request.Items
            .GroupBy(i => i.MasterDocumentTypeId)
            .Select(g => g.First())
            .ToList();

        foreach (var item in distinctItems)
            _ = await unitOfWork.MasterDocumentTypeRepository
                    .GetByIdAsync(item.MasterDocumentTypeId, cancellationToken)
                ?? throw new NotFoundException(
                    $"Master document type '{item.MasterDocumentTypeId}' not found.");

        // Synchronize items in-place to avoid unique constraint violations
        var requestedDocIds = distinctItems.Select(i => i.MasterDocumentTypeId).ToHashSet();

        var existingGroups = profile.DocumentProfileItems
            .GroupBy(i => i.MasterDocumentTypeId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var itemsToRemove = new List<DocumentProfileItem>();
        var itemsToKeepOrUpdate = new Dictionary<Guid, DocumentProfileItem>();

        foreach (var (docTypeId, groupItems) in existingGroups)
        {
            if (requestedDocIds.Contains(docTypeId))
            {
                // Keep the first record, mark any historical duplicates for hard deletion
                itemsToKeepOrUpdate[docTypeId] = groupItems[0];
                for (int i = 1; i < groupItems.Count; i++)
                {
                    groupItems[i].AllowHardDelete = true;
                    itemsToRemove.Add(groupItems[i]);
                }
            }
            else
            {
                // All items for unselected doc type should be hard deleted
                foreach (var item in groupItems)
                {
                    item.AllowHardDelete = true;
                    itemsToRemove.Add(item);
                }
            }
        }

        if (itemsToRemove.Count > 0)
        {
            unitOfWork.DocumentProfileItemRepository.RemoveRange(itemsToRemove);
        }

        var newItems = new List<DocumentProfileItem>();

        foreach (var item in distinctItems)
        {
            if (itemsToKeepOrUpdate.TryGetValue(item.MasterDocumentTypeId, out var existingItem))
            {
                existingItem.OrderIndex = item.OrderIndex;
                existingItem.IsDeleted  = false;
                existingItem.DeletedAt  = null;
                existingItem.DeletedBy  = null;
                existingItem.UpdatedAt  = DateTime.UtcNow;
            }
            else
            {
                newItems.Add(new DocumentProfileItem
                {
                    Id                   = Guid.NewGuid(),
                    DocumentProfileId    = profile.Id,
                    MasterDocumentTypeId = item.MasterDocumentTypeId,
                    OrderIndex           = item.OrderIndex,
                    CreatedAt            = DateTime.UtcNow
                });
            }
        }

        if (newItems.Count > 0)
        {
            await unitOfWork.DocumentProfileItemRepository.AddRangeAsync(newItems, cancellationToken);
        }

        profile.Name                = request.Name;
        profile.Description         = request.Description;
        profile.ProcurementCategory = request.ProcurementCategory;
        profile.UpdatedAt           = DateTime.UtcNow;

        unitOfWork.DocumentProfileRepository.Update(profile);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Document profile updated successfully.");
    }
}