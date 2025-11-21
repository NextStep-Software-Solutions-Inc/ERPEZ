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
        var kpiTarget = await unitOfWork.KPITargetRepository.FindAsync(t => t.Id == request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        // Get only the DU KPI assignments for this specific KPI target
        var emptySieveModel = new Sieve.Models.SieveModel();
        var (duAllocations, _) = await unitOfWork.DUKPIAssignmentRepository.GetAllAsync(emptySieveModel, cancellationToken: cancellationToken);
        var totalAllocated = duAllocations
            .Where(a => a.KPITargetId == request.Id)
            .Sum(a => a.AllocatedTargetValue);

        var result = new KPITargetResponse()
        {
            Id = kpiTarget.Id,
            KPIId = kpiTarget.KPIId,
            TargetValue = kpiTarget.TargetValue,
            RemainingTargetValue = kpiTarget.TargetValue - totalAllocated,
            Period = kpiTarget.Period,
            QuarterName = kpiTarget.QuarterName,
            CreatedAt = kpiTarget.CreatedAt,
            CreatedBy = kpiTarget.CreatedBy
        };
        return ApiResponse<KPITargetResponse>.Success(result, "Retrieved successfully");
    }
}
