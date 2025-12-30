using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Commands.BulkCreateWFPObjectiveTargetExpenditure;

public class BulkCreateWFPObjectiveTargetExpenditureCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<BulkCreateWFPObjectiveTargetExpenditureCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        BulkCreateWFPObjectiveTargetExpenditureCommand request, 
        CancellationToken cancellationToken)
    {
        var itemCount = 0;

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            _ = await unitOfWork.WFPObjectiveTargetRepository.GetByIdAsync(request.WFPObjectiveTargetId, cancellationToken) 
                ?? throw new NotFoundException("WFP Objective Target not found.");

            var expenditures = new List<Domain.Entities.Planning.WFPObjectiveTargetExpenditure>();

            foreach (var expenditureRequest in request.Expenditures)
            {
                _ = await unitOfWork.ObjectRepository.GetByIdAsync(expenditureRequest.ObjectId, cancellationToken) ?? throw new NotFoundException($"Object with ID {expenditureRequest.ObjectId} not found.");

                var existingExpenditure = await unitOfWork.WFPObjectiveTargetExpenditureRepository.FindAsync(exp =>
                    exp.WFPObjectiveTargetId == request.WFPObjectiveTargetId &&
                    exp.ObjectId == expenditureRequest.ObjectId &&
                    exp.ItemDescription == expenditureRequest.ItemDescription,
                    cancellationToken
                );

                if (existingExpenditure != null) throw new ConflictException($"WFP Objective Target Expenditure with Object ID {expenditureRequest.ObjectId} and Item Description '{expenditureRequest.ItemDescription}' already exists.");

                var expenditure = new Domain.Entities.Planning.WFPObjectiveTargetExpenditure
                {
                    WFPObjectiveTargetId = request.WFPObjectiveTargetId,
                    ObjectId = expenditureRequest.ObjectId,
                    ItemDescription = expenditureRequest.ItemDescription,
                    Quantity = expenditureRequest.Quantity,
                    CostEstimates = expenditureRequest.CostEstimates
                };

                expenditures.Add(expenditure);
            }

            await unitOfWork.WFPObjectiveTargetExpenditureRepository.AddRangeAsync(expenditures, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            
            itemCount = expenditures.Count;
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, 
            $"{itemCount} WFP Objective Target Expenditure items created successfully.");
    }
}
