using ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.ResetChecklist;

public class ResetChecklistCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ResetChecklistCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        ResetChecklistCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository
                          .GetByIdAsync(request.ProcurementProjectId, cancellationToken)
                      ?? throw new NotFoundException("Procurement project not found.");

        // Hard lock — cannot reset once project has been posted or beyond
        ChecklistLockGuard.ThrowIfLocked(project.Status);

        if (!project.ChecklistConfirmed)
            throw new ConflictException(
                "Checklist is not confirmed yet. Nothing to reset.");

        project.ChecklistConfirmed = false;
        project.UpdatedAt          = DateTime.UtcNow;

        unitOfWork.ProcurementProjectRepository.Update(project);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value,
            "Checklist reverted to Draft state for editing.");
    }
}