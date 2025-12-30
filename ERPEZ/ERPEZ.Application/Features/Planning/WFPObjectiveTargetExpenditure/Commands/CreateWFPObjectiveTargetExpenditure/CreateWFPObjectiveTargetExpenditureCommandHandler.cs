using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Commands.CreateWFPObjectiveTargetExpenditure;

public class CreateWFPObjectiveTargetExpenditureCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateWFPObjectiveTargetExpenditureCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateWFPObjectiveTargetExpenditureCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.WFPObjectiveTargetRepository.GetByIdAsync(request.WFPObjectiveTargetId, cancellationToken) ?? throw new NotFoundException("WFP Objective Target not found.");
        _ = await unitOfWork.ObjectRepository.GetByIdAsync(request.ObjectId, cancellationToken) ?? throw new NotFoundException("Object not found.");
        var existingABR = await unitOfWork.WFPObjectiveTargetExpenditureRepository.FindAsync(abr =>
        abr.WFPObjectiveTargetId == request.WFPObjectiveTargetId &&
        abr.ObjectId == request.ObjectId &&
        abr.ItemDescription == request.ItemDescription,
            cancellationToken
        );

        if (existingABR != null)
            throw new ConflictException("WFP Objective Target Expenditure already exist.");

        var abr = new Domain.Entities.Planning.WFPObjectiveTargetExpenditure
        {
            WFPObjectiveTargetId = request.WFPObjectiveTargetId,
            ObjectId = request.ObjectId,
            ItemDescription = request.ItemDescription,
            Quantity = request.Quantity,
            CostEstimates = request.CostEstimates
        };

        await unitOfWork.WFPObjectiveTargetExpenditureRepository.AddAsync(abr, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(abr.Id, "WFP Objective Target Expenditure created successfully.");
    }
}
