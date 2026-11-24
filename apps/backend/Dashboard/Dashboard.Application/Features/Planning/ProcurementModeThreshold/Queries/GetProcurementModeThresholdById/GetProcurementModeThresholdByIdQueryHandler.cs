using ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Queries.GetProcurementModeThresholdById;

public class GetProcurementModeThresholdByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProcurementModeThresholdByIdQuery, ApiResponse<ProcurementModeThresholdResponse>>
{
    public async Task<ApiResponse<ProcurementModeThresholdResponse>> Handle(
        GetProcurementModeThresholdByIdQuery request,
        CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementModeThresholdRepository.GetByIdWithNavigationAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement mode threshold not found.");

        var response = new ProcurementModeThresholdResponse
        {
            Id = entity.Id,
            ProcurementModeId = entity.ProcurementModeId,
            ProcurementModeName = entity.ProcurementMode?.Name ?? string.Empty,
            MinThreshold = entity.MinThreshold,
            MaxThreshold = entity.MaxThreshold,
            EffectivityStart = entity.EffectivityStart,
            EffectivityEnd = entity.EffectivityEnd,
            CreatedAt = entity.CreatedAt,
            CreatedBy = entity.CreatedBy,
            UpdatedAt = entity.UpdatedAt,
            UpdatedBy = entity.UpdatedBy
        };

        return ApiResponse<ProcurementModeThresholdResponse>.Success(response);
    }
}
