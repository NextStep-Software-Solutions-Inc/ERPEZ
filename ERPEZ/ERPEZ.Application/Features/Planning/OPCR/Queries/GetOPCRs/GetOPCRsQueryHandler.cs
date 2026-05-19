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

        System.Linq.Expressions.Expression<Func<Domain.Entities.Planning.OPCR, OPCRsResponse>> projection = opcr => new OPCRsResponse
        {
            Id = opcr.Id,
            Name = opcr.Name,
            OfficeId = opcr.OfficeId,
            OfficeName = opcr.Office.Name,
            FiscalYear = opcr.FiscalYear.Year,
            CommitmentStatus = opcr.CommitmentStatus.ToString(),
            ReviewStatus = opcr.ReviewStatus.ToString(),
            SubmittedDate     = opcr.SubmittedDate.HasValue
                                        ? DateOnly.FromDateTime(opcr.SubmittedDate.Value) : null,
            ReturnedDate      = null,
            TotalBudget = opcr.OPCRItems.SelectMany(i => i.OPCRActivities).Sum(a => a.Budget),
            CreatedDate = DateOnly.FromDateTime(opcr.CreatedAt),
            EvaluationCount = opcr.OPCREvaluations.Count,
            KPIAssignmentCount = opcr.OPCRItems.Select(i => i.KPIAssignmentId).Distinct().Count(),
            ActivityCount = opcr.OPCRItems.SelectMany(i => i.OPCRActivities).Count(),
        };

        var (opcrs, totalCount) = await unitOfWork.OPCRRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<OPCRsResponse>(
            [.. opcrs],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
