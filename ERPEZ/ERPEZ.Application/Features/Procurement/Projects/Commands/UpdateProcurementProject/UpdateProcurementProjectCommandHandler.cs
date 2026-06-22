using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProject;

public class UpdateProcurementProjectCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateProcurementProjectCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateProcurementProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository.GetByIdAsync(request.Id, cancellationToken);
        if (project == null)
        {
            return ApiResponse<Unit>.Fail("Procurement project not found.");
        }

        var mode = await unitOfWork.ProcurementModeRepository.GetByIdAsync(request.UpdateRequest.ModeOfProcurementId, cancellationToken);
        if (mode == null)
        {
            return ApiResponse<Unit>.Fail("Procurement mode not found.");
        }

        project.Title = request.UpdateRequest.Title;
        project.ModeOfProcurementId = request.UpdateRequest.ModeOfProcurementId;
        project.ABC = request.UpdateRequest.ABC;
        project.Status = request.UpdateRequest.Status;

        unitOfWork.ProcurementProjectRepository.Update(project);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement project updated successfully.");
    }
}
