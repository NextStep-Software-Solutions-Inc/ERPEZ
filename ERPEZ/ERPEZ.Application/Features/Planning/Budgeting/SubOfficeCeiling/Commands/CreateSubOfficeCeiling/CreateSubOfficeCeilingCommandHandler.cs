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

        _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundClusterId, cancellationToken)
            ?? throw new NotFoundException($"Fund Cluster with ID {request.FundClusterId} not found.");

        _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken)
            ?? throw new NotFoundException($"Fiscal Year with ID {request.FiscalYearId} not found.");

        var masterBudget = await unitOfWork.AgencyMasterBudgetRepository.GetByIdAsync(officeCeiling.AgencyMasterBudgetId, cancellationToken)
            ?? throw new NotFoundException($"Agency Master Budget with ID {officeCeiling.AgencyMasterBudgetId} not found.");

        if (masterBudget.FundSourceId != request.FundClusterId)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Fund Cluster must match the Fund Cluster from the linked Agency Master Budget.");
        }

        if (officeCeiling.FiscalYearId != request.FiscalYearId)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Fiscal Year must match the linked Office Ceiling.");
        }

        var siblings = await unitOfWork.SubOfficeCeilingRepository.ToListAsync(
            unitOfWork.SubOfficeCeilingRepository.Query(x => x.OfficeCeilingId == request.OfficeCeilingId)
                .Select(x => new { x.PSAmount, x.MOOEAmount, x.COAmount }),
            cancellationToken);

        var totalPS = siblings.Sum(x => x.PSAmount) + request.PSAmount;
        var totalMOOE = siblings.Sum(x => x.MOOEAmount) + request.MOOEAmount;
        var totalCO = siblings.Sum(x => x.COAmount) + request.COAmount;

        if (totalPS > officeCeiling.PSAmount || totalMOOE > officeCeiling.MOOEAmount || totalCO > officeCeiling.COAmount)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Sub-Office Ceiling totals must not exceed the parent Office Ceiling amounts.");
        }

        var status = request.Status.ToString();

        var existing = await unitOfWork.SubOfficeCeilingRepository.FindAsync(
            x => x.OfficeCeilingId == request.OfficeCeilingId
                && x.SubOfficeId == request.SubOfficeId
                && x.FundClusterId == request.FundClusterId,
            cancellationToken);

        if (existing != null)
        {
            throw new ConflictException("Sub-Office Ceiling already exists for the selected Office Ceiling, Sub-Office, and Fund Cluster.");
        }

        var entity = new Domain.Entities.Planning.SubOfficeCeiling
        {
            OfficeCeilingId = request.OfficeCeilingId,
            SubOfficeId = request.SubOfficeId,
            FundClusterId = request.FundClusterId,
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

