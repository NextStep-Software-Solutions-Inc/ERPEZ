using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PlantillaType.Commands.UpdatePlantillaType;

public class UpdatePlantillaTypeCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdatePlantillaTypeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdatePlantillaTypeCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.PlantillaTypeRepository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
            throw new NotFoundException($"Plantilla Type with ID '{request.Id}' not found.");

        if (!string.IsNullOrEmpty(request.UpdatePlantillaType.Code) && request.UpdatePlantillaType.Code != entity.Code)
        {
            var existingByCode = await unitOfWork.PlantillaTypeRepository.FindAsync(
                x => x.Code == request.UpdatePlantillaType.Code && x.Id != request.Id,
                cancellationToken
            );

            if (existingByCode != null)
                throw new ConflictException($"PlantillaType with Code '{request.UpdatePlantillaType.Code}' already exists.");

            entity.Code = request.UpdatePlantillaType.Code;
        }

        if (!string.IsNullOrEmpty(request.UpdatePlantillaType.Name))
            entity.Name = request.UpdatePlantillaType.Name;

        if (request.UpdatePlantillaType.Duration != null)
            entity.Duration = request.UpdatePlantillaType.Duration;

        if (request.UpdatePlantillaType.RequiresActingAppointments.HasValue)
            entity.RequiresActingAppointments = request.UpdatePlantillaType.RequiresActingAppointments.Value;

        if (request.UpdatePlantillaType.AllowsContractual.HasValue)
            entity.AllowsContractual = request.UpdatePlantillaType.AllowsContractual.Value;

        if (request.UpdatePlantillaType.IsActive.HasValue)
            entity.IsActive = request.UpdatePlantillaType.IsActive.Value;

        if (request.UpdatePlantillaType.Benefits != null)
            entity.Benefits = request.UpdatePlantillaType.Benefits;

        unitOfWork.PlantillaTypeRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}

