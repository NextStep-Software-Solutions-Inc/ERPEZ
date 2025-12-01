using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Commands.UpdateOffice;

public class UpdateOfficeCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateOfficeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOfficeCommand request, CancellationToken cancellationToken)
    {
        var office = await unitOfWork.OfficeRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Office not found.");
        if (office.Name == request.UpdateOffice?.Name) throw new ConflictException("Office already exist.");

        var dto = request.UpdateOffice;

        office.OfficeHead = dto?.OfficeHead ?? office.OfficeHead;
        office.Name = dto?.Name ?? office.Name;
        office.Description = dto?.Description ?? office.Description;
        office.Address = dto?.Address ?? office.Address;
        office.Email = dto?.Email ?? office.Email;
        office.ContactNumber = dto?.ContactNumber ?? office.ContactNumber;
        office.ResponsibilityCenterCode = dto?.ResponsibilityCenterCode ?? office.ResponsibilityCenterCode;

        if (dto?.IsDeliveryUnit.HasValue == true)
        {
            if (dto.IsDeliveryUnit.Value)
            {
                office.DeliveryUnits ??= [
                    new Domain.Entities.Planning.DeliveryUnit()
                ];
            }
            else
            {
                office.DeliveryUnits?.Clear();
            }
        }

        unitOfWork.OfficeRepository.Update(office);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Office updated successfully.");
    }
}
