using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionConfig.Commands.DeleteFunctionConfig;

public class DeleteFunctionConfigCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteFunctionConfigCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteFunctionConfigCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.FunctionConfigRepository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException("Function Config not found.");

        unitOfWork.FunctionConfigRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
