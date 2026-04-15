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
                    FundClusterId = entity.FundClusterId,
                    OfficeId = entity.OfficeId,
                    ParentLIBId = entity.ParentLIBId,
                    Name = entity.Name ?? string.Empty,
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
                    }
                })
            .ToList();

        return new PaginatedApiResponse<LIBResponse>(items, request.PageNumber, request.PageSize, totalCount);
    }
}

