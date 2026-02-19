using ERPEZ.Application.Features.Planning.PMT.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.PMT.Queries.GetPMTs;

public class GetPMTsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPMTsQuery, PaginatedApiResponse<PMTResponse>>
{
    public async Task<PaginatedApiResponse<PMTResponse>> Handle(GetPMTsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.PMT, PMTResponse>> projection = p => new PMTResponse
        {
            Id = p.Id,
            OrganizationId = p.OrganizationId,
            OrganizationName = p.Organization != null ? p.Organization.Name : null,
            ActiveYear = p.ActiveYear,
            IsManualWorkflow = p.IsManualWorkflow,
            IsActive = !p.IsDeleted,
            CreatedAt = p.CreatedAt,
            CreatedBy = p.CreatedBy
        };

        var (pmts, totalCount) = await unitOfWork.PMTRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<PMTResponse>(
            [.. pmts],
            query.PageNumber,
            query.PageSize,
            totalCount
        );
    }
}
