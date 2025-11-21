using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.KPITarget.Queries.GetKPITargets;

public class GetKPITargetsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetKPITargetsQuery, PaginatedApiResponse<KPITargetResponse>>
{
    public async Task<PaginatedApiResponse<KPITargetResponse>> Handle(GetKPITargetsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        // Get KPI targets with basic projection
        Expression<Func<Domain.Entities.Planning.KPITarget, KPITargetResponse>> projection = kpiTarget => new KPITargetResponse
        {
            Id = kpiTarget.Id,
            KPIId = kpiTarget.KPIId,
            TargetValue = kpiTarget.TargetValue,
            RemainingTargetValue = kpiTarget.TargetValue, // Will be calculated below
            Period = kpiTarget.Period,
            QuarterName = kpiTarget.QuarterName,
            CreatedAt = kpiTarget.CreatedAt,
            CreatedBy = kpiTarget.CreatedBy
        };

        var (kpiTargets, totalCount) = await unitOfWork.KPITargetRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        // Get only the DU KPI assignments for these specific KPI targets using custom filter
        var kpiTargetIds = kpiTargets.Select(t => t.Id).ToList();
        if (kpiTargetIds.Count != 0)
        {
            var aggregatedAllocationsQuery = unitOfWork.DUKPIAssignmentRepository.Query(
                assignment => kpiTargetIds.Contains(assignment.KPITargetId))
                .GroupBy(a => a.KPITargetId)
                .Select(g => new { KPITargetId = g.Key, TotalAllocated = g.Sum(a => a.AllocatedTargetValue) });
            var aggregatedAllocations = await unitOfWork.DUKPIAssignmentRepository.ToListAsync(aggregatedAllocationsQuery, cancellationToken);
            var allocationsByTargetId = aggregatedAllocations.ToDictionary(a => a.KPITargetId, a => a.TotalAllocated);

            // Calculate remaining target values using projection benefits
            kpiTargets = [.. kpiTargets.Select(target => target with
            {
                RemainingTargetValue = target.TargetValue -
                    (allocationsByTargetId.TryGetValue(target.Id, out var allocated) ? allocated : 0)
            })];
        }
        
        return new PaginatedApiResponse<KPITargetResponse>([.. kpiTargets],  query.PageNumber, query.PageSize, totalCount);
    }
}
