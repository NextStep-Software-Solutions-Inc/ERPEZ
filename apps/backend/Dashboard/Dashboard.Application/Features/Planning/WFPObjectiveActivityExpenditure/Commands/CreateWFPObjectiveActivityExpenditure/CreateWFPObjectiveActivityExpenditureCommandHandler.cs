using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Commands.CreateWFPObjectiveActivityExpenditure;

public class CreateWFPObjectiveActivityExpenditureCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateWFPObjectiveActivityExpenditureCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateWFPObjectiveActivityExpenditureCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.WFPObjectiveActivityRepository.GetByIdAsync(request.WFPObjectiveActivityId, cancellationToken) ?? throw new NotFoundException("WFP Objective Target not found.");
        var obj = await unitOfWork.ObjectRepository.GetByIdAsync(request.ObjectId, cancellationToken) ?? throw new NotFoundException("Object not found.");
        
        if (obj.ParentId == null) throw new BadRequestException("The selected Object must be a child object. Root objects are not allowed.");
        
        var existingABR = await unitOfWork.WFPObjectiveActivityExpenditureRepository.FindAsync(abr =>
        abr.WFPObjectiveActivityId == request.WFPObjectiveActivityId &&
        abr.ObjectId == request.ObjectId &&
        abr.ItemDescription == request.ItemDescription,
            cancellationToken
        );

        if (existingABR != null)
            throw new ConflictException("WFP Objective Target Expenditure already exist.");

        var abr = new Domain.Entities.Planning.WFPObjectiveActivityExpenditure
        {
            WFPObjectiveActivityId = request.WFPObjectiveActivityId,
            ObjectId = request.ObjectId,
            ItemDescription = request.ItemDescription,
            Quantity = request.Quantity,
            UnitCost = request.UnitCost
        };

        await unitOfWork.WFPObjectiveActivityExpenditureRepository.AddAsync(abr, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(abr.Id, "WFP Objective Target Expenditure created successfully.");
    }
}
