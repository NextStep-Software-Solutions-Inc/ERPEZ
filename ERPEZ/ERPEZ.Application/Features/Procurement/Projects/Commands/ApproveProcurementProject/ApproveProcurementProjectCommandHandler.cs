using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.ApproveProcurementProject;

public class ApproveProcurementProjectCommandHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService)
    : IRequestHandler<ApproveProcurementProjectCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ApproveProcurementProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository.Query()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            return ApiResponse<Unit>.Fail("Procurement project not found.");

        if (project.Status == "Approved")
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
        project.Status = "Approved";
        project.ApprovalAttachmentFileId = request.Request.AttachmentFileId;

        unitOfWork.ProcurementProjectRepository.Update(project);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement project approved successfully.");
    }
}
