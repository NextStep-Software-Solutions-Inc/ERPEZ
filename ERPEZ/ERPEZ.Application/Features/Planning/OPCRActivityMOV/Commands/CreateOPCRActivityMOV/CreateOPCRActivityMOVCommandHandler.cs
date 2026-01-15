using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Commands.CreateOPCRActivityMOV;

public class CreateOPCRActivityMOVCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateOPCRActivityMOVCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOPCRActivityMOVCommand request, CancellationToken cancellationToken)
    {
        // Verify OPCRActivity exists
        var opcrActivity = await unitOfWork.OPCRActivityRepository.GetByIdAsync(
            request.OPCRActivityId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Activity not found.");

        // Get the KPI associated with the OPCR Activity to ensure traceability
        var duKPITargetAssignment = await unitOfWork.DUKPITargetAssignmentRepository.GetByIdAsync(
            opcrActivity.DUKPITargetAssignmentId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Target Assignment not found.");

        var kpi = await unitOfWork.KPIRepository.GetByIdAsync(
            duKPITargetAssignment.KPIId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI not found.");

        // MOV is now traceable to the parent KPI through the OPCR Activity
        // This enables the Planning Unit to aggregate all MOVs for a KPI across DUs

        // Create the MOV
        var mov = new Domain.Entities.Planning.OPCRActivityMOV
        {
            OPCRActivityId = request.OPCRActivityId,
            FileName = request.FileName,
            Url = request.Url,
            UploadedDate = request.UploadedDate ?? DateTime.UtcNow
        };

        await unitOfWork.OPCRActivityMOVRepository.AddAsync(mov, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(mov.Id, "OPCR Activity MOV created successfully.");
    }
}
