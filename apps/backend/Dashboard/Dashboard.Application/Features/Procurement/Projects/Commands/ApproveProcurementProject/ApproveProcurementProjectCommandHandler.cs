using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.ApproveProcurementProject;

public class ApproveProcurementProjectCommandHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService,
    ICurrentUserService currentUserService)
    : IRequestHandler<ApproveProcurementProjectCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ApproveProcurementProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository.Query()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            return ApiResponse<Unit>.Fail("Procurement project not found.");

        if (project.Status == nameof(StatusEnum.Approved))
            return ApiResponse<Unit>.Fail("Procurement project is already approved.");

        // Promote the temp file to permanent storage
        try
        {
            await fileStorageService.PromoteFileAsync(request.Request.AttachmentFileId);
        }
        catch (Exception ex)
        {
            return ApiResponse<Unit>.Fail($"Failed to attach file: {ex.Message}");
        }

        // Update project
        project.Status = nameof(StatusEnum.Approved);
        project.ApprovalAttachmentFileId = request.Request.AttachmentFileId;

        // Record Audit Trail Approval Event
        Guid? actorId = Guid.TryParse(currentUserService.UserId, out var parsedActorId) ? parsedActorId : null;
        var actorName = currentUserService.Name ?? currentUserService.Username ?? "BAC Approver";
        var role = currentUserService.Roles?.FirstOrDefault() ?? "Approver";

        var approvalEvent = new ProcurementProjectApprovalEvent
        {
            ProcurementProjectId = project.Id,
            Action = nameof(StatusEnum.Approved),
            ActorId = actorId,
            ActorName = actorName,
            Role = role,
            AttachmentFileId = request.Request.AttachmentFileId,
            Timestamp = DateTime.UtcNow
        };

        unitOfWork.ProcurementProjectRepository.Update(project);
        await unitOfWork.ProcurementProjectApprovalEventRepository.AddAsync(approvalEvent, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement project approved successfully.");
    }
}
