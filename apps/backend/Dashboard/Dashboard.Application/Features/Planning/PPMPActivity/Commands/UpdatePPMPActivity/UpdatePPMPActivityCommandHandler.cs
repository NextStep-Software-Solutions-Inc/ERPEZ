using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPActivity.Commands.UpdatePPMPActivity;

public class UpdatePPMPActivityCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdatePPMPActivityCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdatePPMPActivityCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.PPMPActivityRepository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException("PPMP Activity not found.");

        if (request.LIBActivityId.HasValue && request.LIBActivityId.Value != entity.LIBActivityId)
        {
            _ = await unitOfWork.LineItemBudgetActivityRepository.GetByIdAsync(request.LIBActivityId.Value, cancellationToken)
                ?? throw new NotFoundException("LIB Activity not found.");

            var existing = await unitOfWork.PPMPActivityRepository.FindAsync(
                x => x.PPMPId == entity.PPMPId && x.LIBActivityId == request.LIBActivityId.Value && x.Id != entity.Id,
                cancellationToken);

            if (existing != null)
                throw new ConflictException("PPMP Activity already exists for this PPMP and LIB Activity.");

            entity.LIBActivityId = request.LIBActivityId.Value;
        }

        entity.UpdatedAt = DateTime.UtcNow;
        unitOfWork.PPMPActivityRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "PPMP Activity updated successfully.");
    }
}
