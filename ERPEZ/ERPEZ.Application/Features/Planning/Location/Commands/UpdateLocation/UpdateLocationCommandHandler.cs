using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Location.Commands.UpdateLocation;

public sealed class UpdateLocationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateLocationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateLocationCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateLocation;

        if (dto.FiscalYearId.HasValue)
        {
            _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(dto.FiscalYearId.Value, cancellationToken) ?? throw new NotFoundException($"Fiscal Year with the specified ID ({dto.FiscalYearId.Value}) does not exist.");
        }

        var location = await unitOfWork.LocationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Location not found.");
        
        // Check for duplicate name (excluding current location)
        if (dto.Name != null)
        {
            var existingLocation = await unitOfWork.LocationRepository.FindAsync(l => l.Name == dto.Name && l.Id != request.Id && l.FiscalYearId == dto.FiscalYearId,
                cancellationToken);
            if (existingLocation != null)
                throw new ConflictException("Location already exist.");
        }

        location.ParentId = dto?.ParentId ?? location.ParentId;
        location.Name = dto?.Name ?? location.Name;
        location.Code = dto?.Code ?? location.Code;
        location.Type = dto?.Type ?? location.Type;
        location.IsActive = dto?.IsActive ?? location.IsActive;
        location.FiscalYearId = dto?.FiscalYearId ?? location.FiscalYearId;


        unitOfWork.LocationRepository.Update(location);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Location updated successfully.");
    }
}
