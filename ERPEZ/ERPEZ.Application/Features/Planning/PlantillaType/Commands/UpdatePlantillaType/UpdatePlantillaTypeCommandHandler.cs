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

        if (!string.IsNullOrEmpty(request.Request.Code) && request.Request.Code != entity.Code)
        {
            var existingByCode = await unitOfWork.PlantillaTypeRepository.FindAsync(
                x => x.Code == request.Request.Code && x.Id != request.Id,
                cancellationToken
            );

            if (existingByCode != null)
                throw new ConflictException($"PlantillaType with Code '{request.Request.Code}' already exists.");

            entity.Code = request.Request.Code;
        }

        if (!string.IsNullOrEmpty(request.Request.Name))
            entity.Name = request.Request.Name;

        if (request.Request.Duration != null)
            entity.Duration = request.Request.Duration;

        if (request.Request.RequiresActingAppointments.HasValue)
            entity.RequiresActingAppointments = request.Request.RequiresActingAppointments.Value;

        if (request.Request.AllowsContractual.HasValue)
            entity.AllowsContractual = request.Request.AllowsContractual.Value;

        if (request.Request.IsActive.HasValue)
            entity.IsActive = request.Request.IsActive.Value;

        if (request.Request.Benefits != null)
            entity.Benefits = request.Request.Benefits;

        unitOfWork.PlantillaTypeRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
