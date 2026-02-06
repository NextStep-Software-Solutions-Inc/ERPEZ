using ERPEZ.Application.Features.Planning.Position.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.Position.Queries.GetPositionStatistics;

public class GetPositionStatisticsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPositionStatisticsQuery, ApiResponse<PositionStatisticsResponse>>
{
    public async Task<ApiResponse<PositionStatisticsResponse>> Handle(GetPositionStatisticsQuery request, CancellationToken cancellationToken)
    {
        var query = unitOfWork.PositionRepository.Query();

        var totalPositions = await query.CountAsync(cancellationToken);

        var filledPositions = await query
            .CountAsync(p => p.OperationalStatus == "Filled", cancellationToken);

        var vacantPositions = await query
            .CountAsync(p => p.OperationalStatus == "Vacant", cancellationToken);

        var abolishedPositions = await query
            .CountAsync(p => p.OperationalStatus == "Abolished", cancellationToken);

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
