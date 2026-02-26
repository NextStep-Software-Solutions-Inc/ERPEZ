using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PersonnelPosition.Commands.CreatePersonnelPosition;

public class CreatePersonnelPositionCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreatePersonnelPositionCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreatePersonnelPositionCommand request, CancellationToken cancellationToken)
    {
        // Validate User exists
        var user = await unitOfWork.UserRepository.GetByIdAsync(
            request.UserId,
            cancellationToken
        );

        if (user == null)
            throw new NotFoundException($"User with ID '{request.UserId}' not found.");

        // Validate Position exists
        var position = await unitOfWork.PositionRepository.GetByIdAsync(
            request.PositionId,
            cancellationToken
        );

        if (position == null)
            throw new NotFoundException($"Position with ID '{request.PositionId}' not found.");

        // Check if user already has an active assignment to this position
        var hasActiveAssignment = await unitOfWork.PersonnelPositionRepository.HasActiveAssignmentAsync(
            request.UserId,
            request.PositionId,
            cancellationToken
        );

        if (hasActiveAssignment)
            throw new ConflictException($"User is already actively assigned to this position.");

        // Create entity
        var personnelPosition = new Domain.Entities.Planning.PersonnelPosition
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            PositionId = request.PositionId,
            AssignmentType = request.AssignmentType,
            IsActive = request.IsActive,
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };

        await unitOfWork.PersonnelPositionRepository.AddAsync(personnelPosition, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // Update Position OperationalStatus based on active assignments
        if (request.IsActive)
        {
            position.OperationalStatus = nameof(Domain.Enums.PositionStatusEnum.Filled);
            unitOfWork.PositionRepository.Update(position);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return ApiResponse<Guid>.Success(personnelPosition.Id);
    }
}
