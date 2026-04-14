using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Commands.CreateOfficeCeiling;

public class CreateOfficeCeilingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateOfficeCeilingCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOfficeCeilingCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

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

        var targetType = request.TargetType.ToString();
        var status = request.Status.ToString();

        var existing = await unitOfWork.OfficeCeilingRepository.FindAsync(
            x => x.FiscalYearId == request.FiscalYearId
                && x.OfficeId == request.OfficeId
                && x.AgencyMasterBudgetId == request.AgencyMasterBudgetId
                && x.TargetType == targetType
                && x.IsSupplemental == request.IsSupplemental,
            cancellationToken);

        if (existing != null)
        {
            throw new ConflictException("Office Ceiling already exists for the selected Office, Fiscal Year, target type, and supplemental flag.");
        }

        var entity = new Domain.Entities.Planning.OfficeCeiling
        {
            FiscalYearId = request.FiscalYearId,
            TargetType = targetType,
            OfficeId = request.OfficeId,
            AgencyMasterBudgetId = request.AgencyMasterBudgetId,
            PSAmount = request.PSAmount,
            MOOEAmount = request.MOOEAmount,
            COAmount = request.COAmount,
            Status = status,
            IsSupplemental = request.IsSupplemental
        };

        await unitOfWork.OfficeCeilingRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Office Ceiling created successfully.");
    }
}

