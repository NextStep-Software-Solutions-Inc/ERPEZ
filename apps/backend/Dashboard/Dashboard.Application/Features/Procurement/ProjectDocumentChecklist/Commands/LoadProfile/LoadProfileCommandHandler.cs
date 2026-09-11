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