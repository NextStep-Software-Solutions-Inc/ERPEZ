using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Commands.CreateSubOfficeCeiling;

public class CreateSubOfficeCeilingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateSubOfficeCeilingCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateSubOfficeCeilingCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var officeCeiling = await unitOfWork.OfficeCeilingRepository.GetByIdAsync(request.OfficeCeilingId, cancellationToken)
            ?? throw new NotFoundException($"Office Ceiling with ID {request.OfficeCeilingId} not found.");

        _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.SubOfficeId, cancellationToken)
            ?? throw new NotFoundException($"Sub-Office with ID {request.SubOfficeId} not found.");

        _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundSourceId, cancellationToken)
            ?? throw new NotFoundException($"Fund Cluster with ID {request.FundSourceId} not found.");

        _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken)
            ?? throw new NotFoundException($"Fiscal Year with ID {request.FiscalYearId} not found.");

        var masterBudget = await unitOfWork.AgencyMasterBudgetRepository.GetByIdAsync(officeCeiling.AgencyMasterBudgetId, cancellationToken)
            ?? throw new NotFoundException($"Agency Master Budget with ID {officeCeiling.AgencyMasterBudgetId} not found.");

        if (masterBudget.FundSourceId != request.FundSourceId)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Fund Cluster must match the Fund Cluster from the linked Agency Master Budget.");
        }

        if (officeCeiling.FiscalYearId != request.FiscalYearId)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Fiscal Year must match the linked Office Ceiling.");
        }

        var status = request.Status;

        var existing = await unitOfWork.SubOfficeCeilingRepository.FindAsync(
            x => x.OfficeCeilingId == request.OfficeCeilingId
                && x.SubOfficeId == request.SubOfficeId
                && x.FundClusterId == request.FundSourceId,
            cancellationToken);

        if (existing != null)
        {
            throw new ConflictException("Sub-Office Ceiling already exists for the selected Office Ceiling, Sub-Office, and Fund Cluster.");
        }

        var entity = new Domain.Entities.Planning.SubOfficeCeiling
        {
            OfficeCeilingId = request.OfficeCeilingId,
            SubOfficeId = request.SubOfficeId,
            FundClusterId = request.FundSourceId,
            FiscalYearId = request.FiscalYearId,
            PSAmount = request.PSAmount,
            MOOEAmount = request.MOOEAmount,
            COAmount = request.COAmount,
            Status = status
        };

        await unitOfWork.SubOfficeCeilingRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Sub-Office Ceiling created successfully.");
    }
}

