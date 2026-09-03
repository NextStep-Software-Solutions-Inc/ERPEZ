using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.LoadProfile;

public class LoadProfileCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<LoadProfileCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        LoadProfileCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository
                          .GetByIdAsync(request.ProcurementProjectId, cancellationToken)
                      ?? throw new NotFoundException("Procurement project not found.");

        ChecklistLockGuard.ThrowIfLocked(project.Status);

        var profile = await unitOfWork.DocumentProfileRepository
                          .GetByIdWithItemsAsync(request.DocumentProfileId, cancellationToken)
                      ?? throw new NotFoundException("Document profile not found.");

        // Validate procurement category compatibility when project category is available
        string? projectCategory = null;

        if (project.ProcurementModeId.HasValue)
        {
            var mode = await unitOfWork.ProcurementModeRepository
                .GetByIdAsync(project.ProcurementModeId.Value, cancellationToken);
            if (mode?.ProcurementCategoryId.HasValue == true)
            {
                var cat = await unitOfWork.ProcurementCategoryRepository
                    .GetByIdAsync(mode.ProcurementCategoryId.Value, cancellationToken);
                projectCategory = cat?.Name;
            }
        }

        if (projectCategory == null && project.APPItemId.HasValue)
        {
            var appItem = await unitOfWork.APPItemRepository
                .GetByIdAsync(project.APPItemId.Value, cancellationToken);
            if (appItem != null && appItem.ProcurementModeId != Guid.Empty)
            {
                var mode = await unitOfWork.ProcurementModeRepository
                    .GetByIdAsync(appItem.ProcurementModeId, cancellationToken);
                if (mode?.ProcurementCategoryId.HasValue == true)
                {
                    var cat = await unitOfWork.ProcurementCategoryRepository
                        .GetByIdAsync(mode.ProcurementCategoryId.Value, cancellationToken);
                    projectCategory = cat?.Name;
                }
            }
        }

        if (!string.IsNullOrWhiteSpace(projectCategory) &&
            !string.IsNullOrWhiteSpace(profile.ProcurementCategory) &&
            !string.Equals(projectCategory, profile.ProcurementCategory, StringComparison.OrdinalIgnoreCase))
        {
            throw new ConflictException(
                $"The selected profile's category '{profile.ProcurementCategory}' is incompatible with the project's procurement category '{projectCategory}'.");
        }

        // Wipe any existing draft checklist items before re-scaffolding (replace contract)
        var existing = await unitOfWork.ProjectDocumentChecklistRepository
            .GetByProjectIdAsync(request.ProcurementProjectId, cancellationToken);

        if (existing.Count > 0)
            unitOfWork.ProjectDocumentChecklistRepository.RemoveRange(existing);

        var items = profile.DocumentProfileItems
            .Where(i => !i.IsDeleted)
            .OrderBy(i => i.OrderIndex)
            .Select(i => new Domain.Entities.Procurement.ProjectDocumentChecklist
            {
                Id                   = Guid.NewGuid(),
                ProcurementProjectId = request.ProcurementProjectId,
                MasterDocumentTypeId = i.MasterDocumentTypeId,
                EnvelopeType         = i.MasterDocumentType != null ? i.MasterDocumentType.EnvelopeType : 1,
                IsRequired           = true,
                OrderIndex           = i.OrderIndex,
                CreatedAt            = DateTime.UtcNow
            }).ToList();

        await unitOfWork.ProjectDocumentChecklistRepository.AddRangeAsync(items, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value,
            $"Checklist scaffolded from profile '{profile.Name}' ({items.Count} items).");
    }
}