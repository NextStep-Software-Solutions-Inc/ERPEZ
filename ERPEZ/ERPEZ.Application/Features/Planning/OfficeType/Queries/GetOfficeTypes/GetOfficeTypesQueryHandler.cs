using ERPEZ.Application.Features.Planning.OfficeType.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.OfficeType.Queries.GetOfficeTypes;

public class GetOfficeTypesQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetOfficeTypesQuery, PaginatedApiResponse<OfficeTypeResponse>>
{
    public async Task<PaginatedApiResponse<OfficeTypeResponse>> Handle(GetOfficeTypesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.OfficeType, OfficeTypeResponse>> projection = ot => new OfficeTypeResponse
        {
            Id = ot.Id,
            Name = ot.Name,
            Code = ot.Code,
            CanHaveChildren = ot.CanHaveChildren,
            IsActive = ot.IsActive,
            CreatedAt = ot.CreatedAt,
            CreatedBy = ot.CreatedBy
        };

        var (officeTypes, totalCount) = await unitOfWork.OfficeTypeRepository.GetAllAsync(
            sieveModel, 
            projection, 
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<OfficeTypeResponse>(
            [.. officeTypes],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
