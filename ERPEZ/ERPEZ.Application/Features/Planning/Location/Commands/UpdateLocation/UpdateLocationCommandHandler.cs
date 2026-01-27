using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Location.Commands.UpdateLocation;

public sealed class UpdateLocationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateLocationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateLocationCommand request, CancellationToken cancellationToken)
    {
        var location = await unitOfWork.LocationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Location not found.");
        if (location.Name == request.UpdateLocation?.Name) throw new ConflictException("Location already exist.");

        var dto = request.UpdateLocation;
        location.ParentId = dto?.ParentId ?? location.ParentId;
        location.Name = dto?.Name ?? location.Name;
        location.Code = dto?.Code ?? location.Code;
        location.Type = dto?.Type ?? location.Type;
        location.IsActive = dto?.IsActive ?? location.IsActive;


        unitOfWork.LocationRepository.Update(location);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Location updated successfully.");
    }
}
