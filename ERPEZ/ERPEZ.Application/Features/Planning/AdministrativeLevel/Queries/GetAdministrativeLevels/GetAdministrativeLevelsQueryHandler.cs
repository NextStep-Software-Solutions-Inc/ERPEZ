using ERPEZ.Application.Features.Planning.AdministrativeLevel.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.AdministrativeLevel.Queries.GetAdministrativeLevels;

public class GetAdministrativeLevelsQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetAdministrativeLevelsQuery, PaginatedApiResponse<AdministrativeLevelResponse>>
{
    public async Task<PaginatedApiResponse<AdministrativeLevelResponse>> Handle(GetAdministrativeLevelsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.AdministrativeLevel, AdministrativeLevelResponse>> projection = a => new AdministrativeLevelResponse
        {
            Id = a.Id,
            Name = a.Name,
            Code = a.Code,
            CanHaveChildren = a.CanHaveChildren,
            IsActive = a.IsActive,
            CreatedAt = a.CreatedAt,
            CreatedBy = a.CreatedBy
        };

        var (administrativeLevels, totalCount) = await unitOfWork.AdministrativeLevelRepository.GetAllAsync(
            sieveModel, 
            projection, 
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<AdministrativeLevelResponse>(
            [.. administrativeLevels],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
