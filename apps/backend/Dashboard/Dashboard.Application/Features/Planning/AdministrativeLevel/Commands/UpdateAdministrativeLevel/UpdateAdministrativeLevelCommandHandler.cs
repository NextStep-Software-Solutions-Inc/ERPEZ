using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.AdministrativeLevel.Commands.UpdateAdministrativeLevel;

public class UpdateAdministrativeLevelCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdateAdministrativeLevelCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateAdministrativeLevelCommand request, CancellationToken cancellationToken)
    {
        var administrativeLevel = await unitOfWork.AdministrativeLevelRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Administrative Level not found.");

        var dto = request.UpdateAdministrativeLevel;

        if (dto.Code != null && dto.Code != administrativeLevel.Code)
        {
            var duplicate = await unitOfWork.AdministrativeLevelRepository.FindAsync(
                x => x.Code == dto.Code,
                cancellationToken
            );

            if (duplicate != null && duplicate.Id != request.Id)
                throw new ConflictException("Administrative Level with this code already exists.");
        }

        administrativeLevel.Name = dto.Name ?? administrativeLevel.Name;
        administrativeLevel.Code = dto.Code ?? administrativeLevel.Code;
        if (dto.CanHaveChildren.HasValue) administrativeLevel.CanHaveChildren = dto.CanHaveChildren.Value;
        if (dto.IsActive.HasValue) administrativeLevel.IsActive = dto.IsActive.Value;

        unitOfWork.AdministrativeLevelRepository.Update(administrativeLevel);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Administrative Level updated successfully.");
    }
}
