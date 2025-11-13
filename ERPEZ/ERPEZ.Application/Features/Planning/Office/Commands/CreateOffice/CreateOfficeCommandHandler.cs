using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Commands.CreateOffice;

public class CreateOfficeCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOfficeCommand, ApiResponse<Domain.Entities.Planning.Office>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.Office>> Handle(CreateOfficeCommand request, CancellationToken cancellationToken)
    {
        var officeExist = await unitOfWork.OfficeRepository.FindAsync(t => t.Name == request.Name, cancellationToken: cancellationToken);
        if (officeExist != null) throw new ConflictException("Office already exists.");
        var office = new Domain.Entities.Planning.Office
        {
            Name = request.Name,
            Description = request.Description,
            Address = request.Address,
            Email = request.Email,
            ContactNumber = request.ContactNumber,
            OfficeHead = request.OfficeHead,
            ResponsibilityCenterCode = request.ResponsibilityCenterCode
        };
        await unitOfWork.OfficeRepository.AddAsync(office, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Domain.Entities.Planning.Office>.Success(office, "Office created successfully.");
    }
}
