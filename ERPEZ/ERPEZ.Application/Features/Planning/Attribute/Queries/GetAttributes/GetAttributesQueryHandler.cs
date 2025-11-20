using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.Attribute.Queries.GetAttributes;

public class GetAttributesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAttributesQuery, PaginatedApiResponse<AttributeResponse>>
{
    public async Task<PaginatedApiResponse<AttributeResponse>> Handle(GetAttributesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.Attribute, AttributeResponse>> projection = attribute => new AttributeResponse
        {
            Id = attribute.Id,
            Name = attribute.Name,
            Code = attribute.Code,
            Description = attribute.Description,
            ParentAttributeId = attribute.ParentAttributeId
        };

        var (attributes, totalCount) = await unitOfWork.AttributeRepository.GetAllAsync(sieveModel, projection, cancellationToken);

        return new PaginatedApiResponse<AttributeResponse>([.. attributes], query.PageNumber, query.PageSize, totalCount);
    }
}
