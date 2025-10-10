using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Commands.UpdateOffice;

public class UpdateOfficeCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateOfficeCommand, ApiResponse<Domain.Entities.Planning.Office>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.Office>> Handle(UpdateOfficeCommand request, CancellationToken cancellationToken)
    {
        var office = await _unitOfWork.OfficeRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Function Percentage Allocation not found.");
        if (office.Name == request.UpdateOffice?.Name) throw new ConflictException("Function Percentage Allocation already exist.");

        var dto = request.UpdateOffice;

        office.OfficeHead = dto?.OfficeHead ?? office.OfficeHead;
        office.Name = dto?.Name ?? office.Name;
        office.Description = dto?.Description ?? office.Description;
        office.Address = dto?.Address ?? office.Address;
        office.Email = dto?.Email ?? office.Email;
        office.ContactNumber = dto?.ContactNumber ?? office.ContactNumber;
        office.ResponsibilityCenterCode = dto?.ResponsibilityCenterCode ?? office.ResponsibilityCenterCode;



        _unitOfWork.OfficeRepository.Update(office);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.Office>.Success(office, "Office updated successfully.");
    }
}
