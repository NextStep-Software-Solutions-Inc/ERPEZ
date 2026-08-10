using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Commands.CreateProcurementPolicyConfig;

public class CreateProcurementPolicyConfigCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateProcurementPolicyConfigCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateProcurementPolicyConfigCommand request, CancellationToken cancellationToken)
    {
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken);
        if (fiscalYear == null)
            throw new NotFoundException("Fiscal Year not found.");

        var procurementMode = await unitOfWork.ProcurementModeRepository.GetByIdAsync(request.ProcurementModeId, cancellationToken);
        if (procurementMode == null)
            throw new NotFoundException("Procurement Mode not found.");

        var threshold = await unitOfWork.ProcurementModeThresholdRepository.GetByIdAsync(request.ProcurementModeThresholdId, cancellationToken);
        if (threshold == null)
            throw new NotFoundException("Procurement Mode Threshold not found.");

        var existingConfig = await unitOfWork.ProcurementPolicyConfigRepository.FindAsync(
            x => x.FiscalYearId == request.FiscalYearId && x.ProcurementModeId == request.ProcurementModeId,
            cancellationToken);

        if (existingConfig != null)
            throw new ConflictException("Procurement Policy Configuration already exists for this Fiscal Year and Procurement Mode combination.");

        var entity = new Domain.Entities.Planning.ProcurementPolicyConfig
        {
            Id = Guid.NewGuid(),
            FiscalYearId = request.FiscalYearId,
            ProcurementModeId = request.ProcurementModeId,
            ProcurementModeThresholdId = request.ProcurementModeThresholdId,
            MinAmount = request.MinAmount,
            MaxAmount = request.MaxAmount
        };

        await unitOfWork.ProcurementPolicyConfigRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id);
    }
}
