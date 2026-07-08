using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Queries.GetLIBById;

public class GetLIBByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetLIBByIdQuery, ApiResponse<LIBResponse>>
{
    public async Task<ApiResponse<LIBResponse>> Handle(GetLIBByIdQuery query, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LineItemBudgetRepository.GetByIdWithDetailsAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {query.Id} not found.");

        var item = new LIBResponse
        {
            Id = entity.Id,
            FiscalYearId = entity.FiscalYearId,
            FundSourceId = entity.FundSourceId,
            AgencyMasterBudgetId = entity.AgencyMasterBudgetId,
            OfficeId = entity.OfficeId,
            ParentLIBId = entity.ParentLIBId,
            Name = entity.Name ?? string.Empty,
            Scope = entity.Scope ?? string.Empty,
            Level = entity.Level ?? string.Empty,
            LIBNumber = entity.LIBNumber,
            SourceType = entity.SourceType,
            SourceId = entity.SourceId,
            Status = Enum.Parse<LIBStatusEnum>(entity.Status, true),
            ConsolidatedIntoLIBId = entity.ConsolidatedIntoLIBId,
            TotalAmount = entity.TotalAmount,
            Version = entity.Version,
            PreviousVersionId = entity.PreviousVersionId,
            FiscalYear = entity.FiscalYearEntity == null ? null : new LIBFiscalYearResponse
            {
                Id = entity.FiscalYearEntity.Id,
                Year = entity.FiscalYearEntity.Year,
                Description = entity.FiscalYearEntity.Description
            },
            FundSource = entity.FundSource == null ? null : new LIBFundSourceResponse
            {
                Id = entity.FundSource.Id,
                Name = entity.FundSource.Name,
                Code = entity.FundSource.Code,
                Type = entity.FundSource.Type.ToString()
            },
            Office = entity.Office == null ? null : new LIBOfficeResponse
            {
                Id = entity.Office.Id,
                Name = entity.Office.Name,
                Code = entity.Office.Code
            },
            ParentLIB = entity.ParentLIB == null ? null : new LIBSummaryResponse
            {
                Id = entity.ParentLIB.Id,
                LIBNumber = entity.ParentLIB.LIBNumber,
                Name = entity.ParentLIB.Name ?? string.Empty,
                Version = entity.ParentLIB.Version
            },
            ConsolidatedIntoLIB = entity.ConsolidatedIntoLIB == null ? null : new LIBSummaryResponse
            {
                Id = entity.ConsolidatedIntoLIB.Id,
                LIBNumber = entity.ConsolidatedIntoLIB.LIBNumber,
                Name = entity.ConsolidatedIntoLIB.Name ?? string.Empty,
                Version = entity.ConsolidatedIntoLIB.Version
            },
            PreviousVersion = entity.PreviousVersion == null ? null : new LIBSummaryResponse
            {
                Id = entity.PreviousVersion.Id,
                LIBNumber = entity.PreviousVersion.LIBNumber,
                Name = entity.PreviousVersion.Name ?? string.Empty,
                Version = entity.PreviousVersion.Version
            },
            Activities = entity.LineItemBudgetActivities
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
            OrphanDetails = entity.LineItemBudgetDetails
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

        return ApiResponse<LIBResponse>.Success(item);
    }
}

