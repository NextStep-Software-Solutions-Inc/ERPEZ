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

        var entity = await unitOfWork.SubOfficeCeilingRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"Sub-Office Ceiling with ID {command.Id} not found.");

        var officeCeiling = await unitOfWork.OfficeCeilingRepository.GetByIdAsync(request.OfficeCeilingId, cancellationToken)
            ?? throw new NotFoundException($"Office Ceiling with ID {request.OfficeCeilingId} not found.");

        var subOffice = await unitOfWork.OfficeRepository.GetByIdAsync(request.SubOfficeId, cancellationToken)
            ?? throw new NotFoundException($"Sub-Office with ID {request.SubOfficeId} not found.");

        if (subOffice.ParentId != officeCeiling.OfficeId)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Sub-Office must be a direct child of the Office in the selected Office Ceiling.");
        }

        _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundSourceId, cancellationToken)
            ?? throw new NotFoundException($"Fund Source with ID {request.FundSourceId} not found.");

        _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken)
            ?? throw new NotFoundException($"Fiscal Year with ID {request.FiscalYearId} not found.");

        var masterBudget = await unitOfWork.AgencyMasterBudgetRepository.GetByIdAsync(officeCeiling.AgencyMasterBudgetId, cancellationToken)
            ?? throw new NotFoundException($"Agency Master Budget with ID {officeCeiling.AgencyMasterBudgetId} not found.");

        if (masterBudget.FundSourceId != request.FundSourceId)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Fund Source must match the Fund Source from the linked Agency Master Budget.");
        }

        if (officeCeiling.FiscalYearId != request.FiscalYearId)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Fiscal Year must match the linked Office Ceiling.");
        }

        var status = request.Status;

        var existing = await unitOfWork.SubOfficeCeilingRepository.FindAsync(
            x => x.Id != command.Id
                && x.OfficeCeilingId == request.OfficeCeilingId
                && x.SubOfficeId == request.SubOfficeId
                && x.FundClusterId == request.FundSourceId,
            cancellationToken);

        if (existing != null)
        {
            throw new ConflictException("Sub-Office Ceiling already exists for the selected Office Ceiling, Sub-Office, and Fund Cluster.");
        }

        entity.OfficeCeilingId = request.OfficeCeilingId;
        entity.SubOfficeId = request.SubOfficeId;
        entity.FundClusterId = request.FundSourceId;
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

