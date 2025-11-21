using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

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

        // First get the KPI targets
        var (kpiTargets, totalCount) = await unitOfWork.KPITargetRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);

        // Get only the DU KPI assignments for these specific KPI targets
        var kpiTargetIds = kpiTargets.Select(t => t.Id).ToList();
        if (kpiTargetIds.Any())
        {
            var emptySieveModel = new Sieve.Models.SieveModel();
            var (duAllocations, _) = await unitOfWork.DUKPIAssignmentRepository.GetAllAsync(emptySieveModel, cancellationToken: cancellationToken);
            var relevantAllocations = duAllocations.Where(a => kpiTargetIds.Contains(a.KPITargetId)).ToList();
            var allocationsByTargetId = relevantAllocations
                .GroupBy(a => a.KPITargetId)
                .ToDictionary(g => g.Key, g => g.Sum(a => a.AllocatedTargetValue));

            // Project to response DTOs with calculated remaining values
            var result = kpiTargets.Select(kpiTarget => new KPITargetResponse
            {
                Id = kpiTarget.Id,
                KPIId = kpiTarget.KPIId,
                TargetValue = kpiTarget.TargetValue,
                RemainingTargetValue = kpiTarget.TargetValue -
                    (allocationsByTargetId.TryGetValue(kpiTarget.Id, out var allocated) ? allocated : 0),
                Period = kpiTarget.Period,
                QuarterName = kpiTarget.QuarterName,
                CreatedAt = kpiTarget.CreatedAt,
                CreatedBy = kpiTarget.CreatedBy
            }).ToList();

            return new PaginatedApiResponse<KPITargetResponse>(
                [.. result],
                query.PageNumber,
                query.PageSize,
                totalCount);
        }
        else
        {
            // No KPI targets, return empty result
            return new PaginatedApiResponse<KPITargetResponse>(
                [],
                query.PageNumber,
                query.PageSize,
                0);
        }
    }
}
