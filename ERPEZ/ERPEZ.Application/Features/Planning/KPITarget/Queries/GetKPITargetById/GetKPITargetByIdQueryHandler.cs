using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPITarget.Queries.GetKPITargetById;

public class GetKPITargetByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetKPITargetByIdQuery, ApiResponse<KPITargetResponse>>
{
    public async Task<ApiResponse<KPITargetResponse>> Handle(GetKPITargetByIdQuery request, CancellationToken cancellationToken)
    {
        var (kpiTarget, totalAllocated) = await unitOfWork.KPITargetRepository.GetKPITargetWithTotalAllocatedAsync(request.Id, cancellationToken);
        
        if (kpiTarget == null)
        {
            throw new NotFoundException("No data found.");
        }

        var result = new KPITargetResponse()
        {
            Id = kpiTarget.Id,
            KPIId = kpiTarget.KPIId,
            TargetValue = kpiTarget.TargetValue,
            RemainingTargetValue = kpiTarget.TargetValue - totalAllocated,
            Period = kpiTarget.Period.ToString(),
            QuarterName = kpiTarget.QuarterName,
            CreatedAt = kpiTarget.CreatedAt,
            CreatedBy = kpiTarget.CreatedBy
        };
        return ApiResponse<KPITargetResponse>.Success(result, "Retrieved successfully");
    }
}
