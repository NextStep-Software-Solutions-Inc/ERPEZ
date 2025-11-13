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
        var kpiTarget = await unitOfWork.KPITargetRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        decimal kpiTargetValue = kpiTarget.TargetValue;

        var kpi = await unitOfWork.KPIRepository.GetByIdAsync(kpiTarget.KPIId, cancellationToken: cancellationToken);
        if (kpi != null && kpi.IsPercentage)
        {
            kpiTargetValue = kpiTarget.TargetValue * 100;
        }

        var result = new KPITargetResponse()
        {
            Id = kpiTarget.Id,
            KPIId = kpiTarget.KPIId,
            TargetValue = kpiTargetValue,
            Period = kpiTarget.Period,
            QuarterName = kpiTarget.QuarterName,
            CreatedAt = kpiTarget.CreatedAt,
            CreatedBy = kpiTarget.CreatedBy
        };
        return ApiResponse<KPITargetResponse>.Success(result, "Retrieved successfully");
    }
}
