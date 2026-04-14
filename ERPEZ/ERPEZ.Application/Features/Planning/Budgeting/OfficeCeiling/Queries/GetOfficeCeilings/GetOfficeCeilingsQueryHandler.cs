using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Queries.GetOfficeCeilings;

public class GetOfficeCeilingsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetOfficeCeilingsQuery, PaginatedApiResponse<OfficeCeilingResponse>>
{
    public async Task<PaginatedApiResponse<OfficeCeilingResponse>> Handle(GetOfficeCeilingsQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = request.PageNumber,
            PageSize = request.PageSize,
            Filters = request.Filters,
            Sorts = request.Sorts
        };

        var (entities, totalCount) = await unitOfWork.OfficeCeilingRepository
            .GetAllWithDetailsAsync(sieveModel, cancellationToken);

        var items = entities.Select(entity => new OfficeCeilingResponse
                {
                    Id = entity.Id,
                    FiscalYearId = entity.FiscalYearId,
                    TargetType = Enum.Parse<CeilingTargetTypeEnum>(entity.TargetType, true),
                    OfficeId = entity.OfficeId,
                    AgencyMasterBudgetId = entity.AgencyMasterBudgetId,
                    PSAmount = entity.PSAmount,
                    MOOEAmount = entity.MOOEAmount,
                    COAmount = entity.COAmount,
                    Status = Enum.Parse<CeilingStatusEnum>(entity.Status, true),
                    IsSupplemental = entity.IsSupplemental,
                    FiscalYear = entity.FiscalYear == null ? null : new OfficeCeilingFiscalYearResponse
                    {
                        Id = entity.FiscalYear.Id,
                        Year = entity.FiscalYear.Year,
                        Description = entity.FiscalYear.Description
                    },
                    Office = entity.Office == null ? null : new OfficeCeilingOfficeResponse
                    {
                        Id = entity.Office.Id,
                        Name = entity.Office.Name,
                        Code = entity.Office.Code
                    },
                    AgencyMasterBudget = entity.AgencyMasterBudget == null ? null : new OfficeCeilingAgencyMasterBudgetResponse
                    {
                        Id = entity.AgencyMasterBudget.Id,
                        SourceDocumentType = Enum.Parse<SourceDocumentTypeEnum>(entity.AgencyMasterBudget.SourceDocumentType, true),
                        FundClusterId = entity.AgencyMasterBudget.FundClusterId,
                        FiscalYearId = entity.AgencyMasterBudget.FiscalYearId,
                        PSAmount = entity.AgencyMasterBudget.PSAmount,
                        MOOEAmount = entity.AgencyMasterBudget.MOOEAmount,
                        COAmount = entity.AgencyMasterBudget.COAmount
                    },
                    SubOfficeCeilingCount = entity.SubOfficeCeilings.Count
                })
            .ToList();

        return new PaginatedApiResponse<OfficeCeilingResponse>(items, request.PageNumber, request.PageSize, totalCount);
    }
}

