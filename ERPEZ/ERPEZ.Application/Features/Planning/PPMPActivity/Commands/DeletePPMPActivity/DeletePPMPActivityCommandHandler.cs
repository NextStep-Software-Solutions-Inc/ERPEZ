using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPActivity.Commands.DeletePPMPActivity;

public class DeletePPMPActivityCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeletePPMPActivityCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(DeletePPMPActivityCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.PPMPActivityRepository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException("PPMP Activity not found.");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;

        unitOfWork.PPMPActivityRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "PPMP Activity deleted successfully.");
    }
}
