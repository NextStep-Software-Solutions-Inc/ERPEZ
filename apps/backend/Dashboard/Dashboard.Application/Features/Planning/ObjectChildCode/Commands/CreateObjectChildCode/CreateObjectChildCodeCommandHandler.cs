using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectChildCode.Commands.CreateObjectChildCode;

/// <summary>
/// Handler for CreateObjectChildCodeCommand that creates parent-child object relationships.
/// </summary>
public class CreateObjectChildCodeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateObjectChildCodeCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateObjectChildCodeCommand request, CancellationToken cancellationToken)
    {
        var parentObject = await unitOfWork.ObjectRepository.GetByIdAsync(request.ParentObjectId, cancellationToken);
        if (parentObject == null)
        {
            throw new NotFoundException($"Parent Object with ID {request.ParentObjectId} not found.");
        }

        var childObject = await unitOfWork.ObjectRepository.GetByIdAsync(request.ChildObjectId, cancellationToken);
        if (childObject == null)
        {
            throw new NotFoundException($"Child Object with ID {request.ChildObjectId} not found.");
        }

        var existing = await unitOfWork.ObjectChildCodeRepository.FindAsync(
            c => c.ParentObjectId == request.ParentObjectId && c.ChildObjectId == request.ChildObjectId,
            cancellationToken: cancellationToken);

        if (existing != null)
        {
            throw new ConflictException("This parent-child relationship already exists.");
        }

        var ancestors = await unitOfWork.ObjectChildCodeRepository.GetAncestorsAsync(request.ParentObjectId, cancellationToken);
        if (ancestors.Any(a => a.ParentObjectId == request.ChildObjectId))
        {
            throw new ConflictException("Creating this relationship would create a circular reference.");
        }

        var objectChildCode = new Domain.Entities.Planning.ObjectChildCode
        {
            ParentObjectId = request.ParentObjectId,
            ChildObjectId = request.ChildObjectId,
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            AgencyId = request.AgencyId,
            IsActive = request.IsActive
        };

        await unitOfWork.ObjectChildCodeRepository.AddAsync(objectChildCode, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(objectChildCode.Id, "Object child code relationship created successfully.");
    }
}
