using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Commands.UpdateOffice;

public class UpdateOfficeCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateOfficeCommand, ApiResponse<OfficeResponse>>
{
    public async Task<ApiResponse<OfficeResponse>> Handle(UpdateOfficeCommand request, CancellationToken cancellationToken)
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

        unitOfWork.OfficeRepository.Update(office);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new OfficeResponse()
        {
            Id = office.Id,
            ClusterId = office.ClusterId,
            OfficeHead = office.OfficeHead,
            Name = office.Name,
            Description = office.Description,
            Address = office.Address,
            Email = office.Email,
            ContactNumber = office.ContactNumber,
            ResponsibilityCenterCode = office.ResponsibilityCenterCode,
            CreatedBy = office.CreatedBy,
            CreatedAt = office.CreatedAt
        };

        return ApiResponse<OfficeResponse>.Success(result, "Office updated successfully.");
    }
}
