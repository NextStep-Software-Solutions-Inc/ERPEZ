using ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Queries.GetAgencyMasterBudgets;

public class GetAgencyMasterBudgetsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAgencyMasterBudgetsQuery, PaginatedApiResponse<AgencyMasterBudgetResponse>>
{
    public async Task<PaginatedApiResponse<AgencyMasterBudgetResponse>> Handle(GetAgencyMasterBudgetsQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = request.PageNumber,
            PageSize = request.PageSize,
            Filters = request.Filters,
            Sorts = request.Sorts
        };

        var (entities, totalCount) = await unitOfWork.AgencyMasterBudgetRepository
            .GetAllWithDetailsAsync(sieveModel, cancellationToken);

        var items = entities
            .Select(entity => new AgencyMasterBudgetResponse
                {
                    Id = entity.Id,
                    FiscalYearId = entity.FiscalYearId,
                    FundClusterId = entity.FundClusterId,
                    SourceDocumentType = Enum.Parse<SourceDocumentTypeEnum>(entity.SourceDocumentType, true),
                    PSAmount = entity.PSAmount,
                    MOOEAmount = entity.MOOEAmount,
                    COAmount = entity.COAmount,
                    FiscalYear = entity.FiscalYear == null ? null : new AgencyFiscalYearResponse
                    {
                        Id = entity.FiscalYear.Id,
                        Year = entity.FiscalYear.Year,
                        Description = entity.FiscalYear.Description,
                        Status = entity.FiscalYear.Status,
                        IsLocked = entity.FiscalYear.IsLocked,
                        StartDate = entity.FiscalYear.StartDate,
                        EndDate = entity.FiscalYear.EndDate
                    },
                    FundCluster = entity.FundCluster == null ? null : new AgencyFundClusterResponse
                    {
                        Id = entity.FundCluster.Id,
                        Name = entity.FundCluster.Name,
                        Code = entity.FundCluster.Code,
                        Type = entity.FundCluster.Type.ToString(),
                        IsActive = entity.FundCluster.IsActive,
                        ParentId = entity.FundCluster.ParentId,
                        ParentName = entity.FundCluster.ParentSource?.Name,
                        FiscalYearId = entity.FundCluster.FiscalYearId
                    },
                    OfficeCeilings =
                    [
                        .. entity.OfficeCeilings.Select(oc => new AgencyOfficeCeilingResponse
                        {
                            Id = oc.Id,
                            FiscalYearId = oc.FiscalYearId,
                            OfficeId = oc.OfficeId,
                            OfficeName = oc.Office?.Name ?? string.Empty,
                            TargetType = Enum.Parse<CeilingTargetTypeEnum>(oc.TargetType, true),
                            PSAmount = oc.PSAmount,
                            MOOEAmount = oc.MOOEAmount,
                            COAmount = oc.COAmount,
                            Status = Enum.Parse<CeilingStatusEnum>(oc.Status, true),
                            IsSupplemental = oc.IsSupplemental,
                            SubOfficeCeilingCount = oc.SubOfficeCeilings.Count
                        })
                    ]
                })
            .ToList();

        return new PaginatedApiResponse<AgencyMasterBudgetResponse>(items, request.PageNumber, request.PageSize, totalCount);
    }
}
