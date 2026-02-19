using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PersonnelPosition.Commands.UpdatePersonnelPosition;

public class UpdatePersonnelPositionCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdatePersonnelPositionCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdatePersonnelPositionCommand request, CancellationToken cancellationToken)
    {
        var personnelPosition = await unitOfWork.PersonnelPositionRepository.GetByIdAsync(
            request.Id,
            cancellationToken
        );

        if (personnelPosition == null)
            throw new NotFoundException($"Personnel Position with ID '{request.Id}' not found.");

        // Validate Position if provided
        if (request.UpdatePersonnelPosition.PositionId.HasValue)
        {
            var position = await unitOfWork.PositionRepository.GetByIdAsync(
                request.UpdatePersonnelPosition.PositionId.Value,
                cancellationToken
            );

            if (position == null)
                throw new NotFoundException($"Position with ID '{request.UpdatePersonnelPosition.PositionId}' not found.");

            // Check if user already has an active assignment to this position (excluding current record)
            if (request.UpdatePersonnelPosition.PositionId.Value != personnelPosition.PositionId)
            {
                var hasActiveAssignment = await unitOfWork.PersonnelPositionRepository.HasActiveAssignmentAsync(
                    personnelPosition.UserId,
                    request.UpdatePersonnelPosition.PositionId.Value,
                    cancellationToken
                );

                if (hasActiveAssignment)
                    throw new ConflictException($"User is already actively assigned to this position.");
            }

            personnelPosition.PositionId = request.UpdatePersonnelPosition.PositionId.Value;
        }

        // Update fields
        if (!string.IsNullOrEmpty(request.UpdatePersonnelPosition.AssignmentType))
            personnelPosition.AssignmentType = request.UpdatePersonnelPosition.AssignmentType;

        if (request.UpdatePersonnelPosition.IsActive.HasValue)
            personnelPosition.IsActive = request.UpdatePersonnelPosition.IsActive.Value;

        if (request.UpdatePersonnelPosition.StartDate.HasValue)
            personnelPosition.StartDate = request.UpdatePersonnelPosition.StartDate.Value;

        if (request.UpdatePersonnelPosition.EndDate.HasValue)
        {
            // Validate EndDate is after StartDate
            if (request.UpdatePersonnelPosition.EndDate.Value <= personnelPosition.StartDate)
                throw new ConflictException("End Date must be after Start Date.");

            personnelPosition.EndDate = request.UpdatePersonnelPosition.EndDate.Value;
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
