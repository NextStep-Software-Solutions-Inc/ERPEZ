using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Queries.GetLIBs;

public class GetLIBsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetLIBsQuery, PaginatedApiResponse<LIBResponse>>
{
    public async Task<PaginatedApiResponse<LIBResponse>> Handle(GetLIBsQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = request.PageNumber,
            PageSize = request.PageSize,
            Filters = request.Filters,
            Sorts = request.Sorts
        };

        var (entities, totalCount) = await unitOfWork.LineItemBudgetRepository
            .GetAllWithDetailsAsync(sieveModel, cancellationToken);

        var items = entities.Select(entity => new LIBResponse
                {
                    Id = entity.Id,
                    FiscalYearId = entity.FiscalYearId,
                    FundSourceId = entity.FundSourceId,
                    OfficeId = entity.OfficeId,
                    ParentLIBId = entity.ParentLIBId,
                    Name = entity.Name ?? string.Empty,
                    LIBNumber = entity.LIBNumber,
                    SourceType = entity.SourceType,
                    SourceId = entity.SourceId,
                    Scope = entity.Scope,
                    Level = entity.Level,
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
                        Code = entity.FundSource.Code
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
                    AgencyMasterBudgetId = entity.AgencyMasterBudgetId,
                    CreatedAt = entity.CreatedAt,
                    ActivityCount = entity.LineItemBudgetActivities.Count(a => !a.IsDeleted),
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
                            }
                        })
                        .ToList()
                })
            .ToList();

        return new PaginatedApiResponse<LIBResponse>(items, request.PageNumber, request.PageSize, totalCount);
    }
}

