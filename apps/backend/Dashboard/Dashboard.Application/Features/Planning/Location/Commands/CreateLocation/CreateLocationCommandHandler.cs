using ERPEZ.Application.Features.Planning.Location.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Location.Commands.CreateLocation;

public class CreateLocationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateLocationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateLocationCommand request, CancellationToken cancellationToken)
    {
        if (request.FiscalYearId.HasValue)
        {
            _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId.Value, cancellationToken) ?? throw new NotFoundException($"Fiscal Year with the specified ID ({request.FiscalYearId.Value}) does not exist.");
        }

        var locationExist = await unitOfWork.LocationRepository.FindAsync(t => t.Name == request.Name && t.FiscalYearId == request.FiscalYearId, cancellationToken: cancellationToken);
        if (locationExist != null) throw new ConflictException("Location already exists.");
        var location = new Domain.Entities.Planning.Location
        {
            ParentId = request.ParentId,
            Name = request.Name,
            Code = request.Code,
            Type = request.Type,
            IsActive = request.IsActive,
            FiscalYearId = request.FiscalYearId
        };
        await unitOfWork.LocationRepository.AddAsync(location, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Guid>.Success(location.Id, "Location created successfully.");
    }
}
