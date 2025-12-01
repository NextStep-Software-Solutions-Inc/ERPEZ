using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Attribute.Commands.UpdateAttribute;

public class UpdateAttributeCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateAttributeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateAttributeCommand request, CancellationToken cancellationToken)
    {
        var attributeEntity = await unitOfWork.AttributeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Attribute with ID {request.Id} not found.");

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            var existingAttribute = await unitOfWork.AttributeRepository.FindAsync(a => a.Name == request.Name && a.Id != request.Id, cancellationToken);
            if (existingAttribute != null)
            {
                throw new ConflictException($"Attribute with name '{request.Name}' already exists.");
            }
            attributeEntity.Name = request.Name;
        }

        if (request.Code != null)
        {
            attributeEntity.Code = request.Code;
        }

        if (request.Description != null)
        {
            attributeEntity.Description = request.Description;
        }

        if (request.ParentAttributeId.HasValue)
        {
            if (request.ParentAttributeId.Value == request.Id)
            {
                throw new BadRequestException("Attribute cannot be its own parent.");
            }

            var parentAttribute = await unitOfWork.AttributeRepository.GetByIdAsync(request.ParentAttributeId.Value, cancellationToken);
            if (parentAttribute == null)
            {
                throw new NotFoundException($"Parent Attribute with ID {request.ParentAttributeId.Value} not found.");
            }
            attributeEntity.ParentAttributeId = request.ParentAttributeId;
        }

        unitOfWork.AttributeRepository.Update(attributeEntity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Attribute updated successfully.");
    }
}
