using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Attribute.Queries.GetAttributeById;

public class GetAttributeByIdQuery : IRequest<ApiResponse<AttributeResponse>>
{
    public Guid Id { get; set; }
}
