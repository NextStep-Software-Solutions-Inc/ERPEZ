using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Attribute.Queries.GetAttributeById;

public class GetAttributeByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAttributeByIdQuery, ApiResponse<AttributeResponse>>
{
    public async Task<ApiResponse<AttributeResponse>> Handle(GetAttributeByIdQuery request, CancellationToken cancellationToken)
    {
        var attributeEntity = await unitOfWork.AttributeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Attribute with ID {request.Id} not found.");

        var response = new AttributeResponse
        {
            Id = attributeEntity.Id,
            Name = attributeEntity.Name,
            Code = attributeEntity.Code,
            Description = attributeEntity.Description,
            ParentAttributeId = attributeEntity.ParentAttributeId
        };

        return ApiResponse<AttributeResponse>.Success(response);
    }
}
