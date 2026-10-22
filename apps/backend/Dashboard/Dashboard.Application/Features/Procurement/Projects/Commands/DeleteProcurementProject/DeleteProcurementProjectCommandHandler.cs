using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.DeleteProcurementProject;

public class DeleteProcurementProjectCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteProcurementProjectCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteProcurementProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository.Query()
            .Include(p => p.BACResolutions)
            .Include(p => p.BiddingActivitySchedules)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (project == null)
        {
            return ApiResponse<Unit>.Fail("Procurement project not found.");
        }

        if (project.Status == "Draft")
        {
            // Draft projects and their linked draft resolutions/schedules are completely wiped
            unitOfWork.ProcurementProjectRepository.Remove(project, hardDelete: true);
        }
        else
        {
            // For non-draft projects, soft-delete and cascade soft-delete to child entities
            foreach (var resolution in project.BACResolutions)
            {
                unitOfWork.BACResolutionRepository.Remove(resolution);
            }
            foreach (var schedule in project.BiddingActivitySchedules)
            {
                unitOfWork.BiddingActivityScheduleRepository.Remove(schedule);
            }
            unitOfWork.ProcurementProjectRepository.Remove(project);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement project deleted and Consolidated PR status reverted.");
    }
}
