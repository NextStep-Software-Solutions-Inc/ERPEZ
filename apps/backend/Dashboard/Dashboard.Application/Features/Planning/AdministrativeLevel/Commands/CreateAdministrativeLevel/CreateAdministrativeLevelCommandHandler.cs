using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.AdministrativeLevel.Commands.CreateAdministrativeLevel;

public class CreateAdministrativeLevelCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateAdministrativeLevelCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateAdministrativeLevelCommand request, CancellationToken cancellationToken)
    {
        var duplicate = await unitOfWork.AdministrativeLevelRepository.FindAsync(
            x => x.Code == request.Code, 
            cancellationToken);
        
        if (duplicate != null) 
            throw new ConflictException("Administrative Level with this code already exists.");

        var administrativeLevel = new Domain.Entities.Planning.AdministrativeLevel
        {
            Name = request.Name,
            Code = request.Code,
            CanHaveChildren = request.CanHaveChildren,
            IsActive = true
        };

        await unitOfWork.AdministrativeLevelRepository.AddAsync(administrativeLevel, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(administrativeLevel.Id, "Administrative Level created successfully.");
    }
}
