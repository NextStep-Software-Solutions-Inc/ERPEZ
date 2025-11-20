using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Attribute.Commands.CreateAttribute;

public class CreateAttributeCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateAttributeCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateAttributeCommand request, CancellationToken cancellationToken)
    {
        var existingAttribute = await unitOfWork.AttributeRepository.FindAsync(attribute => attribute.Name == request.Name, cancellationToken);
        if (existingAttribute != null)
        {
            throw new ConflictException($"Attribute with name '{request.Name}' already exists.");
        }

        if (request.ParentAttributeId.HasValue)
        {
            var parentAttribute = await unitOfWork.AttributeRepository.GetByIdAsync(request.ParentAttributeId.Value, cancellationToken);
            if (parentAttribute == null)
            {
                throw new NotFoundException($"Parent Attribute with ID {request.ParentAttributeId.Value} not found.");
            }
        }

        var attributeEntity = new Domain.Entities.Planning.Attribute
        {
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            ParentAttributeId = request.ParentAttributeId
        };

        await unitOfWork.AttributeRepository.AddAsync(attributeEntity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(attributeEntity.Id, "Attribute created successfully.");
    }
}
