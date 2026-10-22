using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Queries.GetLIBAmendmentRequestById;

public class GetLIBAmendmentRequestByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetLIBAmendmentRequestByIdQuery, ApiResponse<LIBAmendmentRequestResponse>>
{
    public async Task<ApiResponse<LIBAmendmentRequestResponse>> Handle(GetLIBAmendmentRequestByIdQuery query, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LIBAmendmentRequestRepository.GetByIdWithDetailsAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB Amendment Request with ID {query.Id} not found.");

        var item = new LIBAmendmentRequestResponse
        {
            Id = entity.Id,
            LineItemBudgetId = entity.LineItemBudgetId,
            ProposedLineItemBudgetId = entity.ProposedLineItemBudgetId,
            Reason = Enum.Parse<LIBAmendmentReasonEnum>(entity.Reason, true),
            Justification = entity.Justification,
            Remarks = entity.Remarks,
            Status = Enum.Parse<LIBAmendmentStatusEnum>(entity.Status, true),
            LineItemBudget = entity.LineItemBudget == null ? null : MapLIBToResponse(entity.LineItemBudget),
            ProposedLineItemBudget = entity.ProposedLineItemBudget == null ? null : MapLIBToResponse(entity.ProposedLineItemBudget)
        };

        return ApiResponse<LIBAmendmentRequestResponse>.Success(item);
    }

    private static LIBAmendmentRequestLIBResponse MapLIBToResponse(Domain.Entities.Planning.LineItemBudget lib)
    {
        return new LIBAmendmentRequestLIBResponse
        {
            Id = lib.Id,
            LIBNumber = lib.LIBNumber,
            Name = lib.Name ?? string.Empty,
            Version = lib.Version,
            Activities = lib.LineItemBudgetActivities
                .Where(a => !a.IsDeleted)
                .Select(a => new LIBNestedActivityResponse
                {
                    Id = a.Id,
                    Name = a.Name,
                    WFPObjectiveActivityId = a.WFPObjectiveActivityId,
                    OPCRActivityId = a.OPCRActivityId,
                    WFPObjectiveActivity = a.WFPObjectiveActivity == null ? null : new LIBNestedWFPActivityResponse
                    {
                        Id = a.WFPObjectiveActivity.Id,
                        ActivityName = a.WFPObjectiveActivity.ActivityName
                    },
                    OPCRActivity = a.OPCRActivity == null ? null : new LIBNestedOPCRActivityResponse
                    {
                        Id = a.OPCRActivity.Id,
                        Name = a.OPCRActivity.Name
                    },
                    Details = a.LineItemBudgetDetails
                        .Where(d => !d.IsDeleted)
                        .Select(d => new LIBNestedDetailResponse
                        {
                            Id = d.Id,
                            ObjectId = d.ObjectId,
                            Object = d.Object == null ? null : new LIBNestedObjectResponse
                            {
                                Id = d.Object.Id,
                                Name = d.Object.Name,
                                Code = d.Object.Code
                            },
                            ExpenseClass = d.Object?.ObjectExpenseClasses.FirstOrDefault(oc => oc.IsActive)?.ExpenseClass is { } ec1
                                ? new LIBNestedExpenseClassResponse { Id = ec1.Id, Name = ec1.Name, Code = ec1.Code, Type = ec1.Type.ToString() }
                                : null,
                            WFPObjectiveActivityExpenditureId = d.WFPObjectiveActivityExpenditureId,
                            WFPObjectiveActivityExpenditure = d.WFPObjectiveActivityExpenditure == null ? null : new LIBNestedWFPExpenditureResponse
                            {
                                Id = d.WFPObjectiveActivityExpenditure.Id,
                                ItemDescription = d.WFPObjectiveActivityExpenditure.ItemDescription,
                                Quantity = d.WFPObjectiveActivityExpenditure.Quantity,
                                UnitCost = d.WFPObjectiveActivityExpenditure.UnitCost
                            },
                            Description = d.Description,
                            UnitQuantity = d.UnitQuantity,
                            UnitCost = d.UnitCost,
                            TimelineType = d.TimelineType,
                            StartDate = d.StartDate,
                            EndDate = d.EndDate,
                            Budget = d.Budget
                        })
                        .ToList()
                })
                .ToList(),
            OrphanDetails = lib.LineItemBudgetDetails
                .Where(d => !d.IsDeleted && d.LineItemBudgetActivityId == null)
                .Select(d => new LIBNestedDetailResponse
                {
                    Id = d.Id,
                    ObjectId = d.ObjectId,
                    Object = d.Object == null ? null : new LIBNestedObjectResponse
                    {
                        Id = d.Object.Id,
                        Name = d.Object.Name,
                        Code = d.Object.Code
                    },
                    ExpenseClass = d.Object?.ObjectExpenseClasses.FirstOrDefault(oc => oc.IsActive)?.ExpenseClass is { } ec2
                        ? new LIBNestedExpenseClassResponse { Id = ec2.Id, Name = ec2.Name, Code = ec2.Code, Type = ec2.Type.ToString() }
                        : null,
                    WFPObjectiveActivityExpenditureId = d.WFPObjectiveActivityExpenditureId,
                    WFPObjectiveActivityExpenditure = d.WFPObjectiveActivityExpenditure == null ? null : new LIBNestedWFPExpenditureResponse
                    {
                        Id = d.WFPObjectiveActivityExpenditure.Id,
                        ItemDescription = d.WFPObjectiveActivityExpenditure.ItemDescription,
                        Quantity = d.WFPObjectiveActivityExpenditure.Quantity,
                        UnitCost = d.WFPObjectiveActivityExpenditure.UnitCost
                    },
                    Description = d.Description,
                    UnitQuantity = d.UnitQuantity,
                    UnitCost = d.UnitCost,
                    TimelineType = d.TimelineType,
                    StartDate = d.StartDate,
                    EndDate = d.EndDate,
                    Budget = d.Budget
                })
                .ToList()
        };
    }
}

