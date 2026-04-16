using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Queries.GetOfficeCeilingById;

public class GetOfficeCeilingByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetOfficeCeilingByIdQuery, ApiResponse<OfficeCeilingResponse>>
{
    public async Task<ApiResponse<OfficeCeilingResponse>> Handle(GetOfficeCeilingByIdQuery query, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.OfficeCeilingRepository.GetByIdWithDetailsAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException($"Office Ceiling with ID {query.Id} not found.");

        var item = new OfficeCeilingResponse
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
                FundSourceId = entity.AgencyMasterBudget.FundSourceId,
                FiscalYearId = entity.AgencyMasterBudget.FiscalYearId,
                PSAmount = entity.AgencyMasterBudget.PSAmount,
                MOOEAmount = entity.AgencyMasterBudget.MOOEAmount,
                COAmount = entity.AgencyMasterBudget.COAmount
            },
            SubOfficeCeilingCount = entity.SubOfficeCeilings.Count
        };

        return ApiResponse<OfficeCeilingResponse>.Success(item);
    }
}

