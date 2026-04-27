using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementActivityType.Commands.DeleteProcurementActivityType;

public class DeleteProcurementActivityTypeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteProcurementActivityTypeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteProcurementActivityTypeCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementActivityTypeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement activity type not found.");

        unitOfWork.ProcurementActivityTypeRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement activity type deleted successfully.");
    }
}
