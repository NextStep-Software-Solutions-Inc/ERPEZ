using ERPEZ.Application.Features.Planning.PlantillaType.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PlantillaType.Queries.GetPlantillaTypeById;

public class GetPlantillaTypeByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetPlantillaTypeByIdQuery, ApiResponse<PlantillaTypeResponse>>
{
    public async Task<ApiResponse<PlantillaTypeResponse>> Handle(GetPlantillaTypeByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.PlantillaTypeRepository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
            throw new NotFoundException($"Plantilla Type with ID '{request.Id}' not found.");

        var response = new PlantillaTypeResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Code = entity.Code,
            Duration = entity.Duration,
            RequiresActingAppointments = entity.RequiresActingAppointments,
            AllowsContractual = entity.AllowsContractual,
            IsActive = entity.IsActive,
            Benefits = entity.Benefits,
            CreatedAt = entity.CreatedAt
        };

        return ApiResponse<PlantillaTypeResponse>.Success(response);
    }
}
