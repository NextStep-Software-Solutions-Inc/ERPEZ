using ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.ConfirmChecklist;

public class ConfirmChecklistCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ConfirmChecklistCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        ConfirmChecklistCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository
                          .GetByIdAsync(request.ProcurementProjectId, cancellationToken)
                      ?? throw new NotFoundException("Procurement project not found.");

        ChecklistLockGuard.ThrowIfLocked(project.Status);

        if (project.ChecklistConfirmed)
            throw new ConflictException(
                "Checklist is already confirmed. Reset it first to make changes.");

        var items = await unitOfWork.ProjectDocumentChecklistRepository
            .GetByProjectIdAsync(request.ProcurementProjectId, cancellationToken);

        if (items.Count == 0)
            throw new ConflictException(
                "Cannot confirm an empty checklist. Load a profile first.");

        if (!items.Any(i => i.IsRequired))
            throw new ConflictException(
                "Cannot confirm a checklist with no active requirements. " +
                "At least one item must be toggled on.");

        project.ChecklistConfirmed = true;
        project.UpdatedAt          = DateTime.UtcNow;

        unitOfWork.ProcurementProjectRepository.Update(project);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Checklist confirmed and locked.");
    }
}