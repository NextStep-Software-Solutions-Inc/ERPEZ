using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Commands.UpdateNonCSEItemStatus;

public class UpdateNonCSEItemStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateNonCSEItemStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateNonCSEItemStatusCommand request, CancellationToken cancellationToken)
    {
        var nonCseItem = await unitOfWork.NonCSEItemRepository.GetByIdAsync(request.Id, cancellationToken);
        if (nonCseItem == null)
            throw new NotFoundException("Non-CSE Item not found.");

        nonCseItem.IsActive = request.IsActive;
        nonCseItem.UpdatedAt = DateTime.UtcNow;

        unitOfWork.NonCSEItemRepository.Update(nonCseItem);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var statusText = request.IsActive ? "activated" : "deactivated";
        return ApiResponse<Unit>.Success(Unit.Value, $"Non-CSE Item {statusText} successfully.");
    }
}
