using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Location.Commands.CreateLocation;

public class CreateLocationCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateLocationCommand, ApiResponse<Domain.Entities.Planning.Location>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.Location>> Handle(CreateLocationCommand request, CancellationToken cancellationToken)
    {
        var locationExist = await _unitOfWork.LocationRepository.FindAsync(t => t.Name == request.Name && !t.IsDeleted);
        if (locationExist != null)
        {
            return new()
            {
                Succeeded = false,
                Data = null,
                Message = "Location already exist."
            };
        }
        var location = new Domain.Entities.Planning.Location
        {
            ParentId = request.ParentId,
            Name = request.Name,
            Code = request.Code,
            Type = request.Type,
            IsActive = request.IsActive
        };
        await _unitOfWork.LocationRepository.AddAsync(location, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return throw
            new()
        {
            Data = location,
            Succeeded = true,
            Message = "Location created successfully."
        };
    }
}
