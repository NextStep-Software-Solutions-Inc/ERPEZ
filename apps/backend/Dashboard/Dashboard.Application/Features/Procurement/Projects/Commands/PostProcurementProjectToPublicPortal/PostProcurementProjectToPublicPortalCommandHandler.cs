using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.PostProcurementProjectToPublicPortal;

public class PostProcurementProjectToPublicPortalCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<PostProcurementProjectToPublicPortalCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        PostProcurementProjectToPublicPortalCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository
            .GetByIdAsync(request.ProjectId, cancellationToken)
            ?? throw new NotFoundException("Procurement project not found.");

        if (project.Status == "Posted")
        {
            throw new ConflictException("Project is already posted to the BAC Public Portal.");
        }

        if (project.Status != "Approved")
        {
            throw new ConflictException(
                $"Cannot post project to public portal. Project status must be 'Approved', but current status is '{project.Status}'.");
        }

        if (!project.ChecklistConfirmed)
        {
            throw new ConflictException(
                "Cannot post project to public portal. The project bidding document checklist must be confirmed and finalized first.");
        }

        project.Status = "Posted";
        project.UpdatedAt = DateTime.UtcNow;

        unitOfWork.ProcurementProjectRepository.Update(project);

        var actPosting = await unitOfWork.ProcurementActivityTypeRepository.Query()
            .FirstOrDefaultAsync(a => a.SystemRole == ERPEZ.Domain.Enums.ProcurementActivitySystemRole.AdvertisementPosting, cancellationToken);

        if (actPosting != null)
        {
            var schedule = await unitOfWork.BiddingActivityScheduleRepository.Query()
                .FirstOrDefaultAsync(s => s.ProcurementProjectId == project.Id && s.ProcurementActivityTypeId == actPosting.Id, cancellationToken);

            if (schedule != null)
            {
                schedule.StartDate = DateTime.UtcNow;
                schedule.Status = "Completed";
                unitOfWork.BiddingActivityScheduleRepository.Update(schedule);
            }
            else
            {
                var newSchedule = new ERPEZ.Domain.Entities.Procurement.BiddingActivitySchedule
                {
                    Id = Guid.NewGuid(),
                    ProcurementProjectId = project.Id,
                    ProcurementActivityTypeId = actPosting.Id,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddDays(7),
                    Venue = "PhilGEPS Portal & University Bulletin",
                    Status = "Completed",
                    IsLocked = true
                };
                await unitOfWork.BiddingActivityScheduleRepository.AddAsync(newSchedule, cancellationToken);
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement project successfully posted to the BAC Public Portal.");
    }
}
