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
            FundSourceId = entity.FundSourceId,
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
            FundSource = entity.FundSource == null ? null : new AgencyFundSourceResponse
            {
                Id = entity.FundSource.Id,
                Name = entity.FundSource.Name,
                Code = entity.FundSource.Code,
                Type = entity.FundSource.Type.ToString(),
                IsActive = entity.FundSource.IsActive,
                ParentId = entity.FundSource.ParentId,
                ParentName = entity.FundSource.ParentSource?.Name,
                FiscalYearId = entity.FundSource.FiscalYearId
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
        };

        return ApiResponse<AgencyMasterBudgetResponse>.Success(item);
    }
}
