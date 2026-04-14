using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Queries.GetLIBs;

public class GetLIBsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetLIBsQuery, ApiResponse<List<LIBResponse>>>
{
    public async Task<ApiResponse<List<LIBResponse>>> Handle(GetLIBsQuery request, CancellationToken cancellationToken)
    {
        var entities = await unitOfWork.LineItemBudgetRepository.GetAllWithDetailsAsync(cancellationToken: cancellationToken);

        var items = entities.Select(entity => new LIBResponse
                {
                    Id = entity.Id,
                    FiscalYearId = entity.FiscalYearId,
                    FundClusterId = entity.FundClusterId,
                    OfficeId = entity.OfficeId,
                    ParentLIBId = entity.ParentLIBId,
                    Name = entity.Name ?? string.Empty,
                    LIBNumber = entity.LIBNumber,
                    Level = BudgetingEnumMapper.ToEnum<LIBLevelEnum>(entity.Level, nameof(entity.Level)),
                    SourceType = BudgetingEnumMapper.ToEnum<LIBSourceTypeEnum>(entity.SourceType, nameof(entity.SourceType)),
                    SourceId = entity.SourceId,
                    Status = BudgetingEnumMapper.ToEnum<LIBStatusEnum>(entity.Status, nameof(entity.Status)),
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
                    FundCluster = entity.FundCluster == null ? null : new LIBFundClusterResponse
                    {
                        Id = entity.FundCluster.Id,
                        Name = entity.FundCluster.Name,
                        Code = entity.FundCluster.Code,
                        Type = entity.FundCluster.Type.ToString()
                    },
                    Office = entity.Office == null ? null : new LIBOfficeResponse
                    {
                        Id = entity.Office.Id,
                        Name = entity.Office.Name,
                        Code = entity.Office.Code
                    },
                    DeliveryUnit = entity.DeliveryUnit == null ? null : new LIBDeliveryUnitResponse
                    {
                        Id = entity.DeliveryUnit.Id,
                        OfficeId = entity.DeliveryUnit.OfficeId
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
                    ActivityCount = entity.LineItemBudgetActivities.Count,
                    DetailCount = entity.LineItemBudgetDetails.Count
                })
            .ToList();

        return ApiResponse<List<LIBResponse>>.Success(items);
    }
}

