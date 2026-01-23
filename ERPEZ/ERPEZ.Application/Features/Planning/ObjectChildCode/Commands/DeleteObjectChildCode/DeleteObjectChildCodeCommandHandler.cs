using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectChildCode.Commands.DeleteObjectChildCode;

/// <summary>
/// Handler for DeleteObjectChildCodeCommand that removes parent-child object relationships.
/// </summary>
public class DeleteObjectChildCodeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteObjectChildCodeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteObjectChildCodeCommand request, CancellationToken cancellationToken)
    {
        var objectChildCode = await unitOfWork.ObjectChildCodeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (objectChildCode == null)
        {
            throw new NotFoundException($"Object child code with ID {request.Id} not found.");
        }

        unitOfWork.ObjectChildCodeRepository.Remove(objectChildCode);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Object child code relationship deleted successfully.");
    }
}
