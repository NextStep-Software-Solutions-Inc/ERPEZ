using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.Office.Queries.GetOfficesQuery;

public class GetOfficesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOfficesQuery, PaginatedApiResponse<OfficeResponse>>
{
    public async Task<PaginatedApiResponse<OfficeResponse>> Handle(GetOfficesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        Expression<Func<Domain.Entities.Planning.Office, OfficeResponse>> projection = o => new OfficeResponse
        {
            Id = o.Id,
            ClusterId = o.ClusterId,
            OfficeHead = o.OfficeHead,
            Name = o.Name,
            Description = o.Description,
            Address = o.Address,
            Email = o.Email,
            ContactNumber = o.ContactNumber,
            ResponsibilityCenterCode = o.ResponsibilityCenterCode,
            CreatedBy = o.CreatedBy,
            CreatedAt = o.CreatedAt
        };
        var (offices, totalCount) = await unitOfWork.OfficeRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<OfficeResponse>(
            [.. offices],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
