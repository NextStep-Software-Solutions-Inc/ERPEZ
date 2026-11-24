using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Dtos;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Queries.GetBiddingScheduleByResolutionId;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BiddingSchedules.Queries.GetAllBiddingSchedules;

public record GetAllBiddingSchedulesQuery() : IRequest<ApiResponse<List<BiddingScheduleResponse>>>;

public class GetAllBiddingSchedulesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAllBiddingSchedulesQuery, ApiResponse<List<BiddingScheduleResponse>>>
{
    public async Task<ApiResponse<List<BiddingScheduleResponse>>> Handle(
        GetAllBiddingSchedulesQuery request,
        CancellationToken cancellationToken)
    {
        var allSchedules = await unitOfWork.BiddingActivityScheduleRepository.ToListAsync(
            unitOfWork.BiddingActivityScheduleRepository.Query(), cancellationToken);

        var resolutions = await unitOfWork.BACResolutionRepository.ToListAsync(
            unitOfWork.BACResolutionRepository.Query(), cancellationToken);

        var resolutionMap = resolutions.ToDictionary(r => r.Id);

        var grouped = allSchedules
            .Where(s => s.BACResolutionId.HasValue)
            .GroupBy(s => s.BACResolutionId!.Value);

        var result = new List<BiddingScheduleResponse>();

        foreach (var group in grouped)
        {
            if (!resolutionMap.TryGetValue(group.Key, out var resolution))
                continue;

            var milestones = group.OrderBy(s => s.MilestoneOrder).ToList();
            if (milestones.Count == 0) continue;

            var first = milestones[0];
            var response = GetBiddingScheduleByResolutionIdQueryHandler.MapToResponse(resolution, milestones, first);
            result.Add(response);
        }

        return ApiResponse<List<BiddingScheduleResponse>>.Success(result, "All bidding schedules retrieved.");
    }
}
