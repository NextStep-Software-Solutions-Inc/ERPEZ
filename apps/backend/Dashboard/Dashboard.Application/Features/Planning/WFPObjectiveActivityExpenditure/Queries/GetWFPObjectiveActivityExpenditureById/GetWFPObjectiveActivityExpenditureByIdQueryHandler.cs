using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Queries.GetWFPObjectiveActivityExpenditureById;

public class GetWFPObjectiveActivityExpenditureByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWFPObjectiveActivityExpenditureByIdQuery, ApiResponse<WFPObjectiveActivityExpenditureResponse>>
{
    public async Task<ApiResponse<WFPObjectiveActivityExpenditureResponse>> Handle(GetWFPObjectiveActivityExpenditureByIdQuery request, CancellationToken cancellationToken)
    {
        var wfpObjectiveActivityExpenditureQuery = unitOfWork.WFPObjectiveActivityExpenditureRepository
            .Query(t => t.Id == request.Id)
            .Select(t => new WFPObjectiveActivityExpenditureResponse
            {
                Id = t.Id,
                WFPObjectiveActivityId = t.WFPObjectiveActivityId,
                Object = new ObjectResponse
                {
                    Id = t.Object.Id,
                    Name = t.Object.Name,
                    Code = t.Object.Code,
                    IsActive = t.Object.IsActive,
                    ChildObjectCount = t.Object.ChildObjects.Count,
                    WFPObjectiveActivityExpenditureCount = t.Object.WFPObjectiveActivityExpenditures.Count,
                    TransactionCount = t.Object.Transactions.Count,
                    Parent = t.Object.ParentObject != null ? new ObjectResponse
                    {
                        Id = t.Object.ParentObject.Id,
                        Name = t.Object.ParentObject.Name,
                        Code = t.Object.ParentObject.Code,
                        IsActive = t.Object.ParentObject.IsActive,
                        ChildObjectCount = t.Object.ParentObject.ChildObjects.Count,
                        WFPObjectiveActivityExpenditureCount = t.Object.ParentObject.WFPObjectiveActivityExpenditures.Count,
                        TransactionCount = t.Object.Transactions.Count,
                        Parent = t.Object.ParentObject.ParentObject != null ? new ObjectResponse
                        {
                            Id = t.Object.ParentObject.ParentObject.Id,
                            Name = t.Object.ParentObject.ParentObject.Name,
                            Code = t.Object.ParentObject.ParentObject.Code,
                            IsActive = t.Object.ParentObject.ParentObject.IsActive,
                            ChildObjectCount = t.Object.ParentObject.ParentObject.ChildObjects.Count,
                            WFPObjectiveActivityExpenditureCount = t.Object.ParentObject.ParentObject.WFPObjectiveActivityExpenditures.Count,
                            TransactionCount = t.Object.ParentObject.ParentObject.Transactions.Count,
                            Parent = t.Object.ParentObject.ParentObject.ParentObject != null ? new ObjectResponse
                            {
                                Id = t.Object.ParentObject.ParentObject.ParentObject.Id,
                                Name = t.Object.ParentObject.ParentObject.ParentObject.Name,
                                Code = t.Object.ParentObject.ParentObject.ParentObject.Code,
                                IsActive = t.Object.ParentObject.ParentObject.ParentObject.IsActive,
                                ChildObjectCount = t.Object.ParentObject.ParentObject.ParentObject.ChildObjects.Count,
                                WFPObjectiveActivityExpenditureCount = t.Object.ParentObject.ParentObject.ParentObject.WFPObjectiveActivityExpenditures.Count,
                                TransactionCount = t.Object.ParentObject.ParentObject.ParentObject.Transactions.Count,
                            } : null
                        } : null
                    } : null
                },
                ItemDescription = t.ItemDescription,
                Quantity = t.Quantity ?? 0,
                UnitCost = t.UnitCost ?? 0,
                CreatedBy = t.CreatedBy,
                CreatedAt = t.CreatedAt
            });
        var result = await unitOfWork.WFPObjectiveActivityExpenditureRepository.GetSingleAsync(wfpObjectiveActivityExpenditureQuery, cancellationToken) ?? throw new NotFoundException("WFP Objective Target Expenditure not found.");
        
        return ApiResponse<WFPObjectiveActivityExpenditureResponse>.Success(result, "Retrieved successfully");
    }
}
