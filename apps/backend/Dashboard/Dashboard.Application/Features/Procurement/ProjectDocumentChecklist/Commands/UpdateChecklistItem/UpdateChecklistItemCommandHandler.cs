using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.UpdateChecklistItem;

public class UpdateChecklistItemCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateChecklistItemCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        UpdateChecklistItemCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository
                          .GetByIdAsync(request.ProcurementProjectId, cancellationToken)
                      ?? throw new NotFoundException("Procurement project not found.");

        ChecklistLockGuard.ThrowIfLocked(project.Status);

        var item = await unitOfWork.ProjectDocumentChecklistRepository
                       .GetByIdAsync(request.ChecklistItemId, cancellationToken)
                   ?? throw new NotFoundException("Checklist item not found.");

        if (item.ProcurementProjectId != request.ProcurementProjectId)
            throw new ConflictException("Checklist item does not belong to this project.");

        item.IsRequired  = request.IsRequired;
        item.OrderIndex  = request.OrderIndex;
        item.UpdatedAt   = DateTime.UtcNow;

        unitOfWork.ProjectDocumentChecklistRepository.Update(item);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Checklist item updated.");
    }
}