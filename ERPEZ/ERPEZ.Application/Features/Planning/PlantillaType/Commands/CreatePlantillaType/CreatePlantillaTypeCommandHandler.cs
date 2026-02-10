using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PlantillaType.Commands.CreatePlantillaType;

public class CreatePlantillaTypeCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreatePlantillaTypeCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreatePlantillaTypeCommand request, CancellationToken cancellationToken)
    {
        var existingByCode = await unitOfWork.PlantillaTypeRepository.FindAsync(
            x => x.Code == request.Code,
            cancellationToken
        );

        if (existingByCode != null)
            throw new ConflictException($"PlantillaType with Code '{request.Code}' already exists.");

        var entity = new Domain.Entities.Planning.PlantillaType
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Code = request.Code,
            Duration = request.Duration,
            RequiresActingAppointments = request.RequiresActingAppointments,
            AllowsContractual = request.AllowsContractual,
            IsActive = true,
            Benefits = request.Benefits
        };

        await unitOfWork.PlantillaTypeRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id);
    }
}
