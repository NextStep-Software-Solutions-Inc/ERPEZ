using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Queries.GetWFPObjectiveTargetExpenditureById;

public class GetWFPObjectiveTargetExpenditureByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWFPObjectiveTargetExpenditureByIdQuery, ApiResponse<WFPObjectiveTargetExpenditureResponse>>
{
    public async Task<ApiResponse<WFPObjectiveTargetExpenditureResponse>> Handle(GetWFPObjectiveTargetExpenditureByIdQuery request, CancellationToken cancellationToken)
    {
        var wfpObjectiveTargetExpenditureQuery = unitOfWork.WFPObjectiveTargetExpenditureRepository
            .Query(t => t.Id == request.Id)
            .Select(t => new WFPObjectiveTargetExpenditureResponse
            {
                Id = t.Id,
                WFPObjectiveTargetId = t.WFPObjectiveTargetId,
                Object = new ObjectResponse
                {
                    Id = t.Object.Id,
                    Name = t.Object.Name,
                    Code = t.Object.Code,
                    IsActive = t.Object.IsActive,
                    ChildObjectCount = t.Object.ChildObjects.Count,
                    WFPObjectiveTargetExpenditureCount = t.Object.WFPObjectiveTargetExpenditures.Count,
                    TransactionCount = t.Object.Transactions.Count,
                    Parent = t.Object.ParentObject != null ? new ObjectResponse
                    {
                        Id = t.Object.ParentObject.Id,
                        Name = t.Object.ParentObject.Name,
                        Code = t.Object.ParentObject.Code,
                        IsActive = t.Object.ParentObject.IsActive,
                        ChildObjectCount = t.Object.ParentObject.ChildObjects.Count,
                        WFPObjectiveTargetExpenditureCount = t.Object.ParentObject.WFPObjectiveTargetExpenditures.Count,
                        TransactionCount = t.Object.Transactions.Count,
                        Parent = t.Object.ParentObject.ParentObject != null ? new ObjectResponse
                        {
                            Id = t.Object.ParentObject.ParentObject.Id,
                            Name = t.Object.ParentObject.ParentObject.Name,
                            Code = t.Object.ParentObject.ParentObject.Code,
                            IsActive = t.Object.ParentObject.ParentObject.IsActive,
                            ChildObjectCount = t.Object.ParentObject.ParentObject.ChildObjects.Count,
                            WFPObjectiveTargetExpenditureCount = t.Object.ParentObject.ParentObject.WFPObjectiveTargetExpenditures.Count,
                            TransactionCount = t.Object.ParentObject.ParentObject.Transactions.Count,
                            Parent = t.Object.ParentObject.ParentObject.ParentObject != null ? new ObjectResponse
                            {
                                Id = t.Object.ParentObject.ParentObject.ParentObject.Id,
                                Name = t.Object.ParentObject.ParentObject.ParentObject.Name,
                                Code = t.Object.ParentObject.ParentObject.ParentObject.Code,
                                IsActive = t.Object.ParentObject.ParentObject.ParentObject.IsActive,
                                ChildObjectCount = t.Object.ParentObject.ParentObject.ParentObject.ChildObjects.Count,
                                WFPObjectiveTargetExpenditureCount = t.Object.ParentObject.ParentObject.ParentObject.WFPObjectiveTargetExpenditures.Count,
                                TransactionCount = t.Object.ParentObject.ParentObject.ParentObject.Transactions.Count,
                            } : null
                        } : null
                    } : null
                },
                ItemDescription = t.ItemDescription,
                Quantity = t.Quantity,
                CostEstimates = t.CostEstimates,
                CreatedBy = t.CreatedBy,
                CreatedAt = t.CreatedAt
            });
        var result = await unitOfWork.WFPObjectiveTargetExpenditureRepository.GetSingleAsync(wfpObjectiveTargetExpenditureQuery, cancellationToken) ?? throw new NotFoundException("WFP Objective Target Expenditure not found.");
        
        return ApiResponse<WFPObjectiveTargetExpenditureResponse>.Success(result, "Retrieved successfully");
    }
}
