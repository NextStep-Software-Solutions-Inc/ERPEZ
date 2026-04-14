using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Commands.UpdateSubOfficeCeiling;

public class UpdateSubOfficeCeilingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateSubOfficeCeilingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateSubOfficeCeilingCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var entity = await unitOfWork.SubOfficeCeilingRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Sub-Office Ceiling with ID {request.Id} not found.");

        var officeCeiling = await unitOfWork.OfficeCeilingRepository.GetByIdAsync(request.OfficeCeilingId, cancellationToken)
            ?? throw new NotFoundException($"Office Ceiling with ID {request.OfficeCeilingId} not found.");

        _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.SubOfficeId, cancellationToken)
            ?? throw new NotFoundException($"Sub-Office with ID {request.SubOfficeId} not found.");

        _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundClusterId, cancellationToken)
            ?? throw new NotFoundException($"Fund Cluster with ID {request.FundClusterId} not found.");

        _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken)
            ?? throw new NotFoundException($"Fiscal Year with ID {request.FiscalYearId} not found.");

        var masterBudget = await unitOfWork.AgencyMasterBudgetRepository.GetByIdAsync(officeCeiling.AgencyMasterBudgetId, cancellationToken)
            ?? throw new NotFoundException($"Agency Master Budget with ID {officeCeiling.AgencyMasterBudgetId} not found.");

        if (masterBudget.FundClusterId != request.FundClusterId)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Fund Cluster must match the Fund Cluster from the linked Agency Master Budget.");
        }

        if (officeCeiling.FiscalYearId != request.FiscalYearId)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Fiscal Year must match the linked Office Ceiling.");
        }

        var siblings = await unitOfWork.SubOfficeCeilingRepository.ToListAsync(
            unitOfWork.SubOfficeCeilingRepository.Query(x => x.OfficeCeilingId == request.OfficeCeilingId && x.Id != request.Id)
                .Select(x => new { x.PSAmount, x.MOOEAmount, x.COAmount }),
            cancellationToken);

        var totalPS = siblings.Sum(x => x.PSAmount) + request.PSAmount;
        var totalMOOE = siblings.Sum(x => x.MOOEAmount) + request.MOOEAmount;
        var totalCO = siblings.Sum(x => x.COAmount) + request.COAmount;

        if (totalPS > officeCeiling.PSAmount || totalMOOE > officeCeiling.MOOEAmount || totalCO > officeCeiling.COAmount)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Sub-Office Ceiling totals must not exceed the parent Office Ceiling amounts.");
        }

        var status = BudgetingEnumMapper.ToEntityValue(request.Status);

        var existing = await unitOfWork.SubOfficeCeilingRepository.FindAsync(
            x => x.Id != request.Id
                && x.OfficeCeilingId == request.OfficeCeilingId
                && x.SubOfficeId == request.SubOfficeId
                && x.FundClusterId == request.FundClusterId,
            cancellationToken);

        if (existing != null)
        {
            throw new ConflictException("Sub-Office Ceiling already exists for the selected Office Ceiling, Sub-Office, and Fund Cluster.");
        }

        entity.OfficeCeilingId = request.OfficeCeilingId;
        entity.SubOfficeId = request.SubOfficeId;
        entity.FundClusterId = request.FundClusterId;
        entity.FiscalYearId = request.FiscalYearId;
        entity.PSAmount = request.PSAmount;
        entity.MOOEAmount = request.MOOEAmount;
        entity.COAmount = request.COAmount;
        entity.Status = status;

        unitOfWork.SubOfficeCeilingRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Sub-Office Ceiling updated successfully.");
    }
}

