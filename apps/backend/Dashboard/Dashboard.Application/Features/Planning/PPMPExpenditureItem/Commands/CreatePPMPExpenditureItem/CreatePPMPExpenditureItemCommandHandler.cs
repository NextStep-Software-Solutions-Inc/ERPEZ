using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.CreatePPMPExpenditureItem;

public class CreatePPMPExpenditureItemCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreatePPMPExpenditureItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreatePPMPExpenditureItemCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.PPMPActivityRepository.GetByIdAsync(request.PPMPActivityId, cancellationToken)
            ?? throw new NotFoundException("PPMP Activity not found.");

        var entity = new Domain.Entities.Planning.PPMPExpenditureItem
        {
            Id = Guid.NewGuid(),
            PPMPActivityId = request.PPMPActivityId,
            IsProcurable = request.IsProcurable,
            TotalCost = request.TotalCost,
            CreatedAt = DateTime.UtcNow
        };

        await unitOfWork.PPMPExpenditureItemRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "PPMP Expenditure Item created successfully.");
    }
}
