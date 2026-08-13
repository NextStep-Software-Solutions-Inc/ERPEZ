using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.DeletePPMPExpenditureItem;

public class DeletePPMPExpenditureItemCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeletePPMPExpenditureItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(DeletePPMPExpenditureItemCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.PPMPExpenditureItemRepository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException("PPMP Expenditure Item not found.");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;

        unitOfWork.PPMPExpenditureItemRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "PPMP Expenditure Item deleted successfully.");
    }
}
