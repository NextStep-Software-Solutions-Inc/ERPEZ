using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Commands.BulkCreateWFPObjectiveActivityExpenditure;

public class BulkCreateWFPObjectiveActivityExpenditureCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<BulkCreateWFPObjectiveActivityExpenditureCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        BulkCreateWFPObjectiveActivityExpenditureCommand request, 
        CancellationToken cancellationToken)
    {
        var itemCount = 0;

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            _ = await unitOfWork.WFPObjectiveActivityRepository.GetByIdAsync(request.WFPObjectiveActivityId, cancellationToken) 
                ?? throw new NotFoundException("WFP Objective Target not found.");

            var expenditures = new List<Domain.Entities.Planning.WFPObjectiveActivityExpenditure>();

            foreach (var expenditureRequest in request.Expenditures)
            {
                var obj = await unitOfWork.ObjectRepository.GetByIdAsync(expenditureRequest.ObjectId, cancellationToken) ?? throw new NotFoundException($"Object with ID {expenditureRequest.ObjectId} not found.");
                
                if (obj.ParentId == null) throw new BadRequestException($"The Object with ID {expenditureRequest.ObjectId} must be a child object. Root objects are not allowed.");

                var existingExpenditure = await unitOfWork.WFPObjectiveActivityExpenditureRepository.FindAsync(exp =>
                    exp.WFPObjectiveActivityId == request.WFPObjectiveActivityId &&
                    exp.ObjectId == expenditureRequest.ObjectId &&
                    exp.ItemDescription == expenditureRequest.ItemDescription,
                    cancellationToken
                );

                if (existingExpenditure != null) throw new ConflictException($"WFP Objective Target Expenditure with Object ID {expenditureRequest.ObjectId} and Item Description '{expenditureRequest.ItemDescription}' already exists.");

                var expenditure = new Domain.Entities.Planning.WFPObjectiveActivityExpenditure
                {
                    WFPObjectiveActivityId = request.WFPObjectiveActivityId,
                    ObjectId = expenditureRequest.ObjectId,
                    ItemDescription = expenditureRequest.ItemDescription,
                    Quantity = expenditureRequest.Quantity,
                    UnitCost = expenditureRequest.UnitCost
                };

                expenditures.Add(expenditure);
            }

            await unitOfWork.WFPObjectiveActivityExpenditureRepository.AddRangeAsync(expenditures, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            
            itemCount = expenditures.Count;
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, 
            $"{itemCount} WFP Objective Target Expenditure items created successfully.");
    }
}
