using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PersonnelPosition.Commands.DeletePersonnelPosition;

public class DeletePersonnelPositionCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeletePersonnelPositionCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeletePersonnelPositionCommand request, CancellationToken cancellationToken)
    {
        var personnelPosition = await unitOfWork.PersonnelPositionRepository.GetByIdAsync(
            request.Id,
            cancellationToken
        );

        if (personnelPosition == null)
            throw new NotFoundException($"Personnel Position with ID '{request.Id}' not found.");

        var positionId = personnelPosition.PositionId;

        unitOfWork.PersonnelPositionRepository.Remove(personnelPosition);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // Update Position OperationalStatus based on remaining active assignments
        var position = await unitOfWork.PositionRepository.GetByIdAsync(positionId, cancellationToken);
        if (position != null)
        {
            var hasActiveAssignment = await unitOfWork.PersonnelPositionRepository.HasAnyActiveAssignmentForPositionAsync(
                positionId,
                cancellationToken
            );

            position.OperationalStatus = hasActiveAssignment
                ? nameof(Domain.Enums.PositionStatusEnum.Filled)
                : nameof(Domain.Enums.PositionStatusEnum.Vacant);

            unitOfWork.PositionRepository.Update(position);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
