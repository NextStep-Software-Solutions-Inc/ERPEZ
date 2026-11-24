using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Commands.DeleteProcurementPolicyConfig;

public class DeleteProcurementPolicyConfigCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteProcurementPolicyConfigCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteProcurementPolicyConfigCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementPolicyConfigRepository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException("Procurement Policy Configuration not found.");

        unitOfWork.ProcurementPolicyConfigRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
