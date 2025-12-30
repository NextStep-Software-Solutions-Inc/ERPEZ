using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Location.Commands.CreateLocation;

public class CreateLocationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateLocationCommand, ApiResponse<Domain.Entities.Planning.Location>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.Location>> Handle(CreateLocationCommand request, CancellationToken cancellationToken)
    {
        var locationExist = await unitOfWork.LocationRepository.FindAsync(t => t.Name == request.Name, cancellationToken: cancellationToken);
        if (locationExist != null) throw new ConflictException("Location already exists.");
        var location = new Domain.Entities.Planning.Location
        {
            ParentId = request.ParentId,
            Name = request.Name,
            Code = request.Code,
            Type = request.Type,
            IsActive = request.IsActive
        };
        await unitOfWork.LocationRepository.AddAsync(location, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Guid>.Success(location.Id, "Location created successfully.");
    }
}
