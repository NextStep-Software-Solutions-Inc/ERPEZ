using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.DeletePPMP;

public class DeletePPMPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeletePPMPCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeletePPMPCommand request, CancellationToken cancellationToken)
    {
        var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("PPMP not found.");

        // Only allow deletion of Draft or Returned status
        if (ppmp.Status != ERPEZ.Domain.Enums.StatusEnum.Draft && ppmp.Status != ERPEZ.Domain.Enums.StatusEnum.Returned)
            throw new ValidationException($"Cannot delete PPMP in {ppmp.Status} status.");

        // Soft delete (mark as deleted)
        ppmp.IsDeleted = true;
        ppmp.DeletedAt = DateTime.UtcNow;
        unitOfWork.PPMPRepository.Update(ppmp);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "PPMP deleted successfully.");
    }
}
