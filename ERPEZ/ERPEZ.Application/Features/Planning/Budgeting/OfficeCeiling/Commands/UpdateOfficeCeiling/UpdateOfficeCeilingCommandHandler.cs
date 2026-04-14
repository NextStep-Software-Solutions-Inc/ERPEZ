using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Commands.UpdateOfficeCeiling;

public class UpdateOfficeCeilingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateOfficeCeilingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOfficeCeilingCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var entity = await unitOfWork.OfficeCeilingRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Office Ceiling with ID {request.Id} not found.");

        _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken)
            ?? throw new NotFoundException($"Fiscal Year with ID {request.FiscalYearId} not found.");

        _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken)
            ?? throw new NotFoundException($"Office with ID {request.OfficeId} not found.");

        var masterBudget = await unitOfWork.AgencyMasterBudgetRepository.GetByIdAsync(request.AgencyMasterBudgetId, cancellationToken)
            ?? throw new NotFoundException($"Agency Master Budget with ID {request.AgencyMasterBudgetId} not found.");

        if (masterBudget.FiscalYearId != request.FiscalYearId)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Fiscal Year must match the selected Agency Master Budget.");
        }

        if (request.PSAmount != masterBudget.PSAmount
            || request.MOOEAmount != masterBudget.MOOEAmount
            || request.COAmount != masterBudget.COAmount)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("PS, MOOE, and CO amounts must match the selected Agency Master Budget.");
        }

        var targetType = BudgetingEnumMapper.ToEntityValue(request.TargetType);
        var status = BudgetingEnumMapper.ToEntityValue(request.Status);

        var existing = await unitOfWork.OfficeCeilingRepository.FindAsync(
            x => x.Id != request.Id
                && x.FiscalYearId == request.FiscalYearId
                && x.OfficeId == request.OfficeId
                && x.AgencyMasterBudgetId == request.AgencyMasterBudgetId
                && x.TargetType == targetType
                && x.IsSupplemental == request.IsSupplemental,
            cancellationToken);

        if (existing != null)
        {
            throw new ConflictException("Office Ceiling already exists for the selected Office, Fiscal Year, target type, and supplemental flag.");
        }

        entity.FiscalYearId = request.FiscalYearId;
        entity.TargetType = targetType;
        entity.OfficeId = request.OfficeId;
        entity.AgencyMasterBudgetId = request.AgencyMasterBudgetId;
        entity.PSAmount = request.PSAmount;
        entity.MOOEAmount = request.MOOEAmount;
        entity.COAmount = request.COAmount;
        entity.Status = status;
        entity.IsSupplemental = request.IsSupplemental;

        unitOfWork.OfficeCeilingRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Office Ceiling updated successfully.");
    }
}

