using ERPEZ.Application.Features.Planning.PositionType.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.PositionType.Queries.GetPositionTypes;

public class GetPositionTypesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPositionTypesQuery, PaginatedApiResponse<PositionTypeResponse>>
{
    public async Task<PaginatedApiResponse<PositionTypeResponse>> Handle(GetPositionTypesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts ?? "Name"
        };

        Expression<Func<Domain.Entities.Planning.PositionType, PositionTypeResponse>> projection = x => new PositionTypeResponse
        {
            Id = x.Id,
            Name = x.Name,
            Code = x.Code,
            Description = x.Description,
            EducationalLevel = x.EducationalLevel,
            Category = x.Category,
            IsCareerEligibilityRequired = x.IsCareerEligibilityRequired,
            CanReportDirectly = x.CanReportDirectly,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt
        };

        var (positionTypes, totalCount) = await unitOfWork.PositionTypeRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<PositionTypeResponse>(
            [.. positionTypes],
            query.PageNumber,
            query.PageSize,
            totalCount
        );
    }
}
