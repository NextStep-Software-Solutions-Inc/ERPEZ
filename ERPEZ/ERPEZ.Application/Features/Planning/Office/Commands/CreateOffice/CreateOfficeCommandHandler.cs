using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Commands.CreateOffice;

public class CreateOfficeCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOfficeCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOfficeCommand request, CancellationToken cancellationToken)
    {
        if (request.ClusterId.HasValue)
        {
            _ = await unitOfWork.ClusterRepository.GetByIdAsync(request.ClusterId.Value, cancellationToken: cancellationToken) ??
                throw new NotFoundException("Cluster not found.");
        }

        var officeExist = await unitOfWork.OfficeRepository.FindAsync(t => t.Name == request.Name, cancellationToken: cancellationToken);
        if (officeExist != null) throw new ConflictException("Office already exists.");

        var office = new Domain.Entities.Planning.Office
        {
            ClusterId = request.ClusterId,
            Name = request.Name,
            Description = request.Description,
            Address = request.Address,
            Email = request.Email,
            ContactNumber = request.ContactNumber,
            OfficeHead = request.OfficeHead,
            ResponsibilityCenterCode = request.ResponsibilityCenterCode,
        };

        if(request.IsDeliveryUnit.HasValue && request.IsDeliveryUnit.Value)
        {
            office.DeliveryUnits.Add(new Domain.Entities.Planning.DeliveryUnit());
        }


        await unitOfWork.OfficeRepository.AddAsync(office, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(office.Id, "Office created successfully.");
    }
}
