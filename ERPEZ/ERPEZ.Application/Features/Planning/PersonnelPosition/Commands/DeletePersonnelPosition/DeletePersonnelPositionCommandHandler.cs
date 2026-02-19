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

        unitOfWork.PersonnelPositionRepository.Remove(personnelPosition);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
