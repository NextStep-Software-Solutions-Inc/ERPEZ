using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Commands.UnarchiveProcurementMode;

public class UnarchiveProcurementModeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UnarchiveProcurementModeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UnarchiveProcurementModeCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementModeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement mode not found.");

        if (!entity.IsArchived)
            throw new ConflictException("Procurement mode is not archived.");

        entity.IsArchived = false;
        entity.IsActive = true;

        unitOfWork.ProcurementModeRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement mode unarchived successfully.");
    }
}
