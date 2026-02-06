using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PlantillaType.Commands.DeletePlantillaType;

public class DeletePlantillaTypeCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeletePlantillaTypeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeletePlantillaTypeCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.PlantillaTypeRepository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
            throw new NotFoundException($"Plantilla Type with ID '{request.Id}' not found.");

        unitOfWork.PlantillaTypeRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
