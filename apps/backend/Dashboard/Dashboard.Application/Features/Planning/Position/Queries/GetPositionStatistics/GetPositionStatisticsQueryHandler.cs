using ERPEZ.Application.Features.Planning.Position.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Position.Queries.GetPositionStatistics;

public class GetPositionStatisticsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPositionStatisticsQuery, ApiResponse<PositionStatisticsResponse>>
{
    public async Task<ApiResponse<PositionStatisticsResponse>> Handle(GetPositionStatisticsQuery request, CancellationToken cancellationToken)
    {
        var totalPositions = await unitOfWork.PositionRepository.CountAllAsync(cancellationToken);

        var filledPositions = await unitOfWork.PositionRepository
            .CountByStatusAsync(nameof(PositionStatusEnum.Filled), cancellationToken);

        var vacantPositions = await unitOfWork.PositionRepository
            .CountByStatusAsync(nameof(PositionStatusEnum.Vacant), cancellationToken);

        var abolishedPositions = await unitOfWork.PositionRepository
            .CountByStatusAsync(nameof(PositionStatusEnum.Abolished), cancellationToken);

        var statistics = new PositionStatisticsResponse
        {
            TotalPositions = totalPositions,
            TotalActiveIncumbents = filledPositions,
            FilledPositions = filledPositions,
            VacantPositions = vacantPositions,
            AbolishedPositions = abolishedPositions,
            VacancyVariance = totalPositions - filledPositions
        };

        return ApiResponse<PositionStatisticsResponse>.Success(statistics);
    }
}
