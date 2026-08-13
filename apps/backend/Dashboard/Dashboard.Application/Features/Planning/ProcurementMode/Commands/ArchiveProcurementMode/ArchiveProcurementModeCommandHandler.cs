using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Commands.ArchiveProcurementMode;

public class ArchiveProcurementModeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ArchiveProcurementModeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ArchiveProcurementModeCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementModeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement mode not found.");

        if (entity.IsArchived)
            throw new ConflictException("Procurement mode is already archived.");

        entity.IsArchived = true;
        entity.IsActive = false;

        unitOfWork.ProcurementModeRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement mode archived successfully.");
    }
}
