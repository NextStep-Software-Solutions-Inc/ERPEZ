using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Attribute.Queries.GetAttributes;

public record GetAttributesQuery : PaginatedQuery<PaginatedApiResponse<AttributeResponse>>
{
}
