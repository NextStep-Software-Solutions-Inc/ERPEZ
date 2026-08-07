using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.WFP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Queries.GetWFPs;

public class GetWFPsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWFPsQuery, PaginatedApiResponse<WFPsResponse>>
{
    public async Task<PaginatedApiResponse<WFPsResponse>> Handle(GetWFPsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.WFP, WFPsResponse>> projection = wfp => new WFPsResponse
        {
            Id = wfp.Id,
            OfficeId = wfp.OfficeId,
            OfficeName = wfp.Office.Name,
            OPCRId = wfp.OPCRId,
            OPCRName = wfp.OPCR != null ? wfp.OPCR.Name : null,
            FundSourceId = wfp.FundSourceId,
            FundSourceName = wfp.FundSource != null ? wfp.FundSource.Name : null,
            ProjectTitle = wfp.ProjectTitle,
            ProjectStartDate = wfp.ProjectStartDate,
            ProjectEndDate = wfp.ProjectEndDate,
            ProposedBudget = wfp.ProposedBudget,
            GeneralObjective = wfp.GeneralObjective,
            Mode = wfp.Mode.ToString(),
            Status = wfp.Status.ToString(),
            CreatedBy = wfp.CreatedBy,
            CreatedAt = wfp.CreatedAt,
            ObjectiveCount = wfp.WFPObjectives.Count
        };

        var (wfps, totalCount) = await unitOfWork.WFPRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<WFPsResponse>(
            [.. wfps],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
