using ERPEZ.Application.Features.Planning.OPCRActivityMOV.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Queries.GetOPCRActivityMOVById;

public class GetOPCRActivityMOVByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetOPCRActivityMOVByIdQuery, ApiResponse<OPCRActivityMOVDetailedResponse>>
{
    public async Task<ApiResponse<OPCRActivityMOVDetailedResponse>> Handle(
        GetOPCRActivityMOVByIdQuery request,
        CancellationToken cancellationToken)
    {
        var mov = await unitOfWork.OPCRActivityMOVRepository.GetByIdWithDetailsAsync(
            request.Id,
            cancellationToken) ?? throw new NotFoundException("OPCR Activity MOV not found.");

        var result = new OPCRActivityMOVDetailedResponse
        {
            Id = mov.Id,
            OPCRActivityId = mov.OPCRActivityId,
            OPCRActivityName = mov.OPCRActivity?.Name ?? string.Empty,
            KPIId = mov.OPCRActivity?.DUKPITargetAssignment?.KPIId ?? Guid.Empty,
            KPIName = mov.OPCRActivity?.DUKPITargetAssignment?.KPI?.Name ?? string.Empty,
            FileName = mov.FileName,
            Url = mov.Url,
            UploadedDate = mov.UploadedDate,
            CreatedAt = mov.CreatedAt,
            CreatedBy = mov.CreatedBy
        };

        return ApiResponse<OPCRActivityMOVDetailedResponse>.Success(result, "Retrieved successfully.");
    }
}
