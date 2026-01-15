using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Queries.GetOPCRs;

public class GetOPCRsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRsQuery, PaginatedApiResponse<OPCRsResponse>>
{
    public async Task<PaginatedApiResponse<OPCRsResponse>> Handle(GetOPCRsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.OPCR, OPCRsResponse>> projection = opcr => new OPCRsResponse
        {
            Id = opcr.Id,
            Name = opcr.Name,
            DeliveryUnitId = opcr.DeliveryUnitId,
            OfficeName = opcr.DeliveryUnit.Office.Name,
            FiscalYear = opcr.FiscalYear.Year,
            Status = opcr.Status.ToString(),
            RatingStatus = opcr.RatingStatus.ToString(),
            SubmittedDate = opcr.RatingSubmittedDate.HasValue ? DateOnly.FromDateTime(opcr.RatingSubmittedDate.Value) : null,
            ReturnedDate = opcr.RatingReturnedDate.HasValue ? DateOnly.FromDateTime(opcr.RatingReturnedDate.Value) : null,
            TotalBudget = opcr.OPCRActivities.Sum(a => a.Budget),
            CreatedDate = DateOnly.FromDateTime(opcr.CreatedAt),
            EvaluationCount = opcr.OPCREvaluations.Count,
            KPITargetAssignmentCount = opcr.DeliveryUnit.KPITargetAssignments.Count,
            ActivityCount = opcr.OPCRActivities.Count,
        };

        var (opcrs, totalCount) = await unitOfWork.OPCRRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<OPCRsResponse>(
            [.. opcrs],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
