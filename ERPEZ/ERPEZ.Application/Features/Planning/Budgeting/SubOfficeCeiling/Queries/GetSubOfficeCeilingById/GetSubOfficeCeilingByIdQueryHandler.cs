using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Queries.GetSubOfficeCeilingById;

public class GetSubOfficeCeilingByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetSubOfficeCeilingByIdQuery, ApiResponse<SubOfficeCeilingResponse>>
{
    public async Task<ApiResponse<SubOfficeCeilingResponse>> Handle(GetSubOfficeCeilingByIdQuery query, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.SubOfficeCeilingRepository.GetByIdWithDetailsAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException($"Sub-Office Ceiling with ID {query.Id} not found.");

        var item = new SubOfficeCeilingResponse
        {
            Id = entity.Id,
            OfficeCeilingId = entity.OfficeCeilingId,
            SubOfficeId = entity.SubOfficeId,
            FundClusterId = entity.FundClusterId,
            FiscalYearId = entity.FiscalYearId,
            PSAmount = entity.PSAmount,
            MOOEAmount = entity.MOOEAmount,
            COAmount = entity.COAmount,
            Status = BudgetingEnumMapper.ToEnum<CeilingStatusEnum>(entity.Status, nameof(entity.Status)),
            OfficeCeiling = entity.OfficeCeiling == null ? null : new SubOfficeCeilingOfficeCeilingResponse
            {
                Id = entity.OfficeCeiling.Id,
                OfficeId = entity.OfficeCeiling.OfficeId,
                OfficeName = entity.OfficeCeiling.Office?.Name ?? string.Empty,
                TargetType = BudgetingEnumMapper.ToEnum<CeilingTargetTypeEnum>(entity.OfficeCeiling.TargetType, nameof(entity.OfficeCeiling.TargetType))
            },
            SubOffice = entity.SubOffice == null ? null : new SubOfficeCeilingOfficeResponse
            {
                Id = entity.SubOffice.Id,
                Name = entity.SubOffice.Name,
                Code = entity.SubOffice.Code
            },
            FundCluster = entity.FundCluster == null ? null : new SubOfficeCeilingFundClusterResponse
            {
                Id = entity.FundCluster.Id,
                Name = entity.FundCluster.Name,
                Code = entity.FundCluster.Code,
                Type = entity.FundCluster.Type.ToString()
            },
            FiscalYear = entity.FiscalYear == null ? null : new SubOfficeCeilingFiscalYearResponse
            {
                Id = entity.FiscalYear.Id,
                Year = entity.FiscalYear.Year,
                Description = entity.FiscalYear.Description
            }
        };

        return ApiResponse<SubOfficeCeilingResponse>.Success(item);
    }
}

