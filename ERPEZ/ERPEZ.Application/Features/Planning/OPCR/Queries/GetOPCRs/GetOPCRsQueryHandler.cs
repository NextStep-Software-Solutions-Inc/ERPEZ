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
            TotalBudget = opcr.OPCRActivities.Select(a => a.Budget).Sum(),
            CreatedDate = DateOnly.FromDateTime(opcr.CreatedAt),
            EvaluationCount = opcr.OPCREvaluations.Count,
            KPITargetAssignmentCount = opcr.DeliveryUnit.KPIAssignments.Count,
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
