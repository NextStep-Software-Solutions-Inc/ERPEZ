using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionConfig.Commands.UpdateFunctionConfig;

public class UpdateFunctionConfigCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateFunctionConfigCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateFunctionConfigCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.FunctionConfigRepository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException("Function Configuration not found.");

        entity.StrategicMinWeight = request.StrategicMinWeight;
        entity.StrategicMaxWeight = request.StrategicMaxWeight;
        entity.CoreFunctionMinWeight = request.CoreFunctionMinWeight;
        entity.CoreFunctionMaxWeight = request.CoreFunctionMaxWeight;
        entity.SupportMinWeight = request.SupportMinWeight;
        entity.SupportMaxWeight = request.SupportMaxWeight;

        unitOfWork.FunctionConfigRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id);
    }
}
