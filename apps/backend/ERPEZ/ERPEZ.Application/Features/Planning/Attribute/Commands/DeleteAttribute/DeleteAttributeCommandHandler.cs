using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using AttributeEntity = ERPEZ.Domain.Entities.Planning.Attribute;

namespace ERPEZ.Application.Features.Planning.Attribute.Commands.DeleteAttribute;

public class DeleteAttributeCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteAttributeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteAttributeCommand request, CancellationToken cancellationToken)
    {
        var attributeEntity = await unitOfWork.AttributeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Attribute with ID {request.Id} not found.");

        unitOfWork.AttributeRepository.Remove(attributeEntity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Attribute deleted successfully.");
    }
}
