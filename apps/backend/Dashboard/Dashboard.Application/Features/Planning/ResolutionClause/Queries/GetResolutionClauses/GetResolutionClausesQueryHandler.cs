using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Planning.ResolutionClause.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Application.Features.Planning.ResolutionClause.Queries.GetResolutionClauses;

public class GetResolutionClausesQueryHandler(IUnitOfWork unitOfWork, ISieveProcessor sieveProcessor)
    : IRequestHandler<GetResolutionClausesQuery, PaginatedApiResponse<ResolutionClauseResponse>>
{
    public async Task<PaginatedApiResponse<ResolutionClauseResponse>> Handle(GetResolutionClausesQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = unitOfWork.ResolutionClauseRepository.Query().Where(c => !c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(query.ClauseType))
        {
            var targetType = query.ClauseType.Trim();
            dbQuery = dbQuery.Where(c => c.ClauseType.ToLower() == targetType.ToLower());
        }

        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        var filteredQuery = sieveProcessor.Apply(sieveModel, dbQuery, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var rawEntities = await paginatedQuery.ToListAsync(cancellationToken);

        var entities = rawEntities.Select(c => new ResolutionClauseResponse
        {
            Id = c.Id,
            Name = c.Name,
            Body = c.Body,
            ClauseType = c.ClauseType
        }).ToList();

        return new PaginatedApiResponse<ResolutionClauseResponse>(
            entities,
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
