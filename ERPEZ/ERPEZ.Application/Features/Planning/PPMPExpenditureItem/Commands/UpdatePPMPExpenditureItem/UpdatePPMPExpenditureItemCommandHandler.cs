using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.UpdatePPMPExpenditureItem;

public class UpdatePPMPExpenditureItemCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdatePPMPExpenditureItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdatePPMPExpenditureItemCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.PPMPExpenditureItemRepository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException("PPMP Expenditure Item not found.");

        if (request.PPMPActivityId.HasValue && request.PPMPActivityId.Value != entity.PPMPActivityId)
        {
            _ = await unitOfWork.PPMPActivityRepository.GetByIdAsync(request.PPMPActivityId.Value, cancellationToken)
                ?? throw new NotFoundException("PPMP Activity not found.");

            entity.PPMPActivityId = request.PPMPActivityId.Value;
        }

        if (request.IsProcurable.HasValue)
            entity.IsProcurable = request.IsProcurable.Value;

        if (request.TotalCost.HasValue)
            entity.TotalCost = request.TotalCost.Value;

        entity.UpdatedAt = DateTime.UtcNow;
        unitOfWork.PPMPExpenditureItemRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "PPMP Expenditure Item updated successfully.");
    }
}
