using ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Queries.GetUACSCodeCombinationFiscalYears;

/// <summary>
/// Handler for retrieving all UACS code combination fiscal year associations with pagination.
/// </summary>
public class GetUACSCodeCombinationFiscalYearsQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetUACSCodeCombinationFiscalYearsQuery, PaginatedApiResponse<UACSCodeCombinationFiscalYearResponse>>
{
    public async Task<PaginatedApiResponse<UACSCodeCombinationFiscalYearResponse>> Handle(GetUACSCodeCombinationFiscalYearsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.UACSCodeCombinationFiscalYear, UACSCodeCombinationFiscalYearResponse>> projection = entity => new UACSCodeCombinationFiscalYearResponse
        {
            Id = entity.Id,
            UACSCodeCombinationId = entity.UACSCodeCombinationId,
            FiscalYearId = entity.FiscalYearId,
            IsValidFrom = entity.IsValidFrom,
            IsValidTo = entity.IsValidTo,
            IsActive = entity.IsActive,
            CreatedBy = entity.CreatedBy,
            CreatedAt = entity.CreatedAt
        };

        var (entities, totalCount) = await unitOfWork.UACSCodeCombinationFiscalYearRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        
        return new PaginatedApiResponse<UACSCodeCombinationFiscalYearResponse>(
            [.. entities],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
