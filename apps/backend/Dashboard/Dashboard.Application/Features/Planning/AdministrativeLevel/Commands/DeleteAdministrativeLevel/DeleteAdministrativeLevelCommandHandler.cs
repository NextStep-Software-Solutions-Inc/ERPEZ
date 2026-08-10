using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.AdministrativeLevel.Commands.DeleteAdministrativeLevel;

public class DeleteAdministrativeLevelCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeleteAdministrativeLevelCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteAdministrativeLevelCommand request, CancellationToken cancellationToken)
    {
        var administrativeLevel = await unitOfWork.AdministrativeLevelRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Administrative Level not found.");

        unitOfWork.AdministrativeLevelRepository.Remove(administrativeLevel);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Administrative Level deleted successfully.");
    }
}
