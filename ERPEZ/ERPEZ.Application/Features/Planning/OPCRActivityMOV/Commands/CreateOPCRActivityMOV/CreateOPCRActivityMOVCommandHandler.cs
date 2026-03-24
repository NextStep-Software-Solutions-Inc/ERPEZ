using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Commands.CreateOPCRActivityMOV;

public class CreateOPCRActivityMOVCommandHandler(IUnitOfWork unitOfWork, IFileStorageService fileStorageService)
    : IRequestHandler<CreateOPCRActivityMOVCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOPCRActivityMOVCommand request, CancellationToken cancellationToken)
    {
        // Verify OPCRActivity exists
        var opcrActivity = await unitOfWork.OPCRActivityRepository.GetByIdAsync(
            request.OPCRActivityId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Activity not found.");

        var activityContextQuery = unitOfWork.OPCRActivityRepository
            .Query(a => a.Id == request.OPCRActivityId)
            .Select(a => new
            {
                MasterKPIId = a.OPCRItem.KPIAssignment.FYActiveKPI != null
                    ? (Guid?)a.OPCRItem.KPIAssignment.FYActiveKPI.MasterKPIId
                    : null
            });

        var activityContext = await unitOfWork.OPCRActivityRepository.GetSingleAsync(
            activityContextQuery,
            cancellationToken)
            ?? throw new NotFoundException("OPCR Activity context not found.");

        if (!activityContext.MasterKPIId.HasValue)
        {
            throw new NotFoundException("KPI not found.");
        }

        _ = await unitOfWork.KPIRepository.GetByIdAsync(
            activityContext.MasterKPIId.Value, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI not found.");

        // MOV is now traceable to the parent KPI through the OPCR Activity
        // This enables the Planning Unit to aggregate all MOVs for a KPI across DUs

        // Promote the temporary file to permanent storage
        var url = await fileStorageService.PromoteFileAsync(request.FileId);

        // Extract filename from the URL (blob name format: {fileId}_{filename})
        var blobName = url.Split('/').Last();
        var fileName = blobName.Contains('_') ? blobName[(blobName.IndexOf('_') + 1)..] : blobName;

        // Create the MOV
        var mov = new Domain.Entities.Planning.OPCRActivityMOV
        {
            OPCRActivityId = request.OPCRActivityId,
            FileName = fileName,
            Url = url,
            UploadedDate = DateTime.UtcNow
        };

        await unitOfWork.OPCRActivityMOVRepository.AddAsync(mov, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(mov.Id, "OPCR Activity MOV created successfully.");
    }
}
