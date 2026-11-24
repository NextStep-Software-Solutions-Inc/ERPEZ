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

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.ReturnProcurementProject;

public class ReturnProcurementProjectCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<ReturnProcurementProjectCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ReturnProcurementProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository.Query()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            return ApiResponse<Unit>.Fail("Procurement project not found.");

        if (project.Status == nameof(StatusEnum.Returned))
            return ApiResponse<Unit>.Fail("Procurement project is already returned.");

        // Set status to Returned
        project.Status = nameof(StatusEnum.Returned);

        // Record Audit Trail Return Event
        Guid? actorId = Guid.TryParse(currentUserService.UserId, out var parsedActorId) ? parsedActorId : null;
        var actorName = currentUserService.Name ?? currentUserService.Username ?? "BAC Reviewer";
        var role = currentUserService.Roles?.FirstOrDefault() ?? "Reviewer";

        var approvalEvent = new ProcurementProjectApprovalEvent
        {
            ProcurementProjectId = project.Id,
            Action = nameof(StatusEnum.Returned),
            ActorId = actorId,
            ActorName = actorName,
            Role = role,
            Remarks = request.Request.Remarks,
            Timestamp = DateTime.UtcNow
        };

        unitOfWork.ProcurementProjectRepository.Update(project);
        await unitOfWork.ProcurementProjectApprovalEventRepository.AddAsync(approvalEvent, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement project returned successfully.");
    }
}
