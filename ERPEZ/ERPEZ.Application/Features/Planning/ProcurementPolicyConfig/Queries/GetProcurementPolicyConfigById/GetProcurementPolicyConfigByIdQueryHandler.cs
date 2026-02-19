using ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Queries.GetProcurementPolicyConfigById;

public class GetProcurementPolicyConfigByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProcurementPolicyConfigByIdQuery, ApiResponse<ProcurementPolicyConfigResponse>>
{
    public async Task<ApiResponse<ProcurementPolicyConfigResponse>> Handle(GetProcurementPolicyConfigByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementPolicyConfigRepository.Query()
            .Include(x => x.FiscalYear)
            .Include(x => x.ProcurementMode)
            .Include(x => x.ProcurementModeThreshold)
            .FirstOrDefaultAsync(x => x.Id == request.Id && !x.IsDeleted, cancellationToken);

        if (entity == null)
            throw new NotFoundException("Procurement Policy Configuration not found.");

        var response = new ProcurementPolicyConfigResponse
        {
            Id = entity.Id,
            FiscalYearId = entity.FiscalYearId,
            FiscalYearYear = entity.FiscalYear?.Year ?? 0,
            ProcurementModeId = entity.ProcurementModeId,
            ProcurementModeName = entity.ProcurementMode?.Name ?? string.Empty,
            ProcurementModeThresholdId = entity.ProcurementModeThresholdId,
            MinAmount = entity.MinAmount,
            MaxAmount = entity.MaxAmount,
            CreatedAt = entity.CreatedAt,
            CreatedBy = entity.CreatedBy,
            UpdatedAt = entity.UpdatedAt,
            UpdatedBy = entity.UpdatedBy
        };

        return ApiResponse<ProcurementPolicyConfigResponse>.Success(response);
    }
}
