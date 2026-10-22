using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OfficeType.Commands.UpdateOfficeType;

public class UpdateOfficeTypeCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdateOfficeTypeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOfficeTypeCommand request, CancellationToken cancellationToken)
    {
        var officeType = await unitOfWork.OfficeTypeRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OfficeType not found.");

        var dto = request.UpdateOfficeType;

        if (dto.Code != null && dto.Code != officeType.Code)
        {
            var duplicate = await unitOfWork.OfficeTypeRepository.FindAsync(
                x => x.Code == dto.Code,
                cancellationToken
            );

            if (duplicate != null && duplicate.Id != request.Id)
                throw new ConflictException("OfficeType with this code already exists.");
        }

        officeType.Name = dto.Name ?? officeType.Name;
        officeType.Code = dto.Code ?? officeType.Code;
        if (dto.CanHaveChildren.HasValue) officeType.CanHaveChildren = dto.CanHaveChildren.Value;
        if (dto.IsActive.HasValue) officeType.IsActive = dto.IsActive.Value;

        unitOfWork.OfficeTypeRepository.Update(officeType);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OfficeType updated successfully.");
    }
}
