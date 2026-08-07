using ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Queries.GetUACSCodeSegmentFiscalYears;

/// <summary>
/// Handler for retrieving all UACS code segment fiscal year associations with pagination.
/// </summary>
public class GetUACSCodeSegmentFiscalYearsQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetUACSCodeSegmentFiscalYearsQuery, PaginatedApiResponse<UACSCodeSegmentFiscalYearResponse>>
{
    public async Task<PaginatedApiResponse<UACSCodeSegmentFiscalYearResponse>> Handle(GetUACSCodeSegmentFiscalYearsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.UACSCodeSegmentFiscalYear, UACSCodeSegmentFiscalYearResponse>> projection = entity => new UACSCodeSegmentFiscalYearResponse
        {
            Id = entity.Id,
            UACSCodeSegmentId = entity.UACSCodeSegmentId,
            FiscalYearId = entity.FiscalYearId,
            EffectiveStartDate = entity.EffectiveStartDate,
            EffectiveEndDate = entity.EffectiveEndDate,
            IsActive = entity.IsActive,
            CreatedBy = entity.CreatedBy,
            CreatedAt = entity.CreatedAt
        };

        var (entities, totalCount) = await unitOfWork.UACSCodeSegmentFiscalYearRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        
        return new PaginatedApiResponse<UACSCodeSegmentFiscalYearResponse>(
            [.. entities],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
