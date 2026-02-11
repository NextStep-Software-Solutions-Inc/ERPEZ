using ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Queries.GetProcurementModeThresholds;

public class GetProcurementModeThresholdsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProcurementModeThresholdsQuery, PaginatedApiResponse<ProcurementModeThresholdResponse>>
{
    public async Task<PaginatedApiResponse<ProcurementModeThresholdResponse>> Handle(
        GetProcurementModeThresholdsQuery request,
        CancellationToken cancellationToken)
    {
        Expression<Func<Domain.Entities.Planning.ProcurementModeThreshold, ProcurementModeThresholdResponse>> projection = x => new ProcurementModeThresholdResponse
        {
            Id = x.Id,
            ProcurementModeId = x.ProcurementModeId,
            ProcurementModeName = x.ProcurementMode != null ? x.ProcurementMode.Name : string.Empty,
            MinThreshold = x.MinThreshold,
            MaxThreshold = x.MaxThreshold,
            EffectivityStart = x.EffectivityStart,
            EffectivityEnd = x.EffectivityEnd,
            CreatedAt = x.CreatedAt,
            CreatedBy = x.CreatedBy,
            UpdatedAt = x.UpdatedAt,
            UpdatedBy = x.UpdatedBy
        };

        var (thresholds, totalCount) = await unitOfWork.ProcurementModeThresholdRepository.GetAllAsync(
            request.SieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<ProcurementModeThresholdResponse>(
            [.. thresholds],
            request.SieveModel.Page ?? 1,
            request.SieveModel.PageSize ?? 10,
            totalCount);
    }
}
