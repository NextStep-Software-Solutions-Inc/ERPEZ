using ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Queries.GetAgencyMasterBudgetById;

public class GetAgencyMasterBudgetByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAgencyMasterBudgetByIdQuery, ApiResponse<AgencyMasterBudgetResponse>>
{
    public async Task<ApiResponse<AgencyMasterBudgetResponse>> Handle(GetAgencyMasterBudgetByIdQuery query, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.AgencyMasterBudgetRepository.GetByIdWithDetailsAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException($"Agency Master Budget with ID {query.Id} not found.");

        var item = new AgencyMasterBudgetResponse
        {
            Id = entity.Id,
            FiscalYearId = entity.FiscalYearId,
            FundClusterId = entity.FundClusterId,
            SourceDocumentType = BudgetingEnumMapper.ToEnum<SourceDocumentTypeEnum>(entity.SourceDocumentType, nameof(entity.SourceDocumentType)),
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
                    TargetType = BudgetingEnumMapper.ToEnum<CeilingTargetTypeEnum>(oc.TargetType, nameof(oc.TargetType)),
                    PSAmount = oc.PSAmount,
                    MOOEAmount = oc.MOOEAmount,
                    COAmount = oc.COAmount,
                    Status = BudgetingEnumMapper.ToEnum<CeilingStatusEnum>(oc.Status, nameof(oc.Status)),
                    IsSupplemental = oc.IsSupplemental,
                    SubOfficeCeilingCount = oc.SubOfficeCeilings.Count
                })
            ]
        };

        return ApiResponse<AgencyMasterBudgetResponse>.Success(item);
    }
}
