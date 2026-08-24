using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.CreatePPMP;

public class CreatePPMPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreatePPMPCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreatePPMPCommand request, CancellationToken cancellationToken)
    {
        // Guard: master PPMPs cannot be linked to another master
        if (request.IsMaster && request.ConsolidatedIntoId.HasValue)
            throw new ValidationException("A master PPMP cannot be consolidated into another PPMP.");

        // Validate Office
        _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"Office with ID {request.OfficeId} not found.");

        // Validate FiscalYear
        _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"Fiscal Year with ID {request.FiscalYearId} not found.");

        // Validate FundSource if provided
        if (request.FundSourceId.HasValue)
        {
            _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundSourceId.Value, cancellationToken: cancellationToken)
                ?? throw new NotFoundException($"Fund Source with ID {request.FundSourceId.Value} not found.");
        }

        // Validate LIB if provided
        if (request.LIBId.HasValue)
        {
            var lib = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.LIBId.Value, cancellationToken: cancellationToken)
                ?? throw new NotFoundException($"Line Item Budget with ID {request.LIBId.Value} not found.");

            if (lib.OfficeId.HasValue && lib.OfficeId.Value != request.OfficeId)
            {
                throw new ValidationException("The selected Line-Item Budget does not belong to the selected office.");
            }

            if (lib.FiscalYearId.HasValue && lib.FiscalYearId.Value != request.FiscalYearId)
            {
                throw new ValidationException("The selected Line-Item Budget does not belong to the selected fiscal year.");
            }
        }

        // Validate the target master PPMP if this is a department PPMP being linked
        if (request.ConsolidatedIntoId.HasValue)
        {
            var masterPpmp = await unitOfWork.PPMPRepository.GetByIdAsync(request.ConsolidatedIntoId.Value, cancellationToken: cancellationToken)
                ?? throw new NotFoundException($"Master PPMP with ID {request.ConsolidatedIntoId.Value} not found.");

            if (!masterPpmp.IsMaster)
                throw new ValidationException("The target PPMP is not a master PPMP.");

            if (masterPpmp.FiscalYearId != request.FiscalYearId)
                throw new ValidationException("The department PPMP must belong to the same fiscal year as the master PPMP.");
        }

        var version = 1;

        // A ParentId means this is an amendment of an approved PPMP
        if (request.ParentId.HasValue)
        {
            var parentPpmp = await unitOfWork.PPMPRepository.GetByIdAsync(request.ParentId.Value, cancellationToken: cancellationToken)
                ?? throw new NotFoundException($"Parent PPMP with ID {request.ParentId.Value} not found.");

            if (parentPpmp.Status != ERPEZ.Domain.Enums.StatusEnum.Approved)
                throw new ValidationException("Only approved PPMPs can be amended.");

            version = parentPpmp.Version + 1;
        }

        var existingPPMP = await unitOfWork.PPMPRepository.FindAsync(
            x => x.PPMPNumber == request.PPMPNumber && x.FiscalYearId == request.FiscalYearId && x.Version == version,
            cancellationToken
        );

        if (existingPPMP != null)
            throw new ConflictException("A PPMP with the same number, fiscal year, and version already exists.");

        var ppmp = new Domain.Entities.Planning.PPMP
        {
            PPMPNumber = request.PPMPNumber,
            Description = request.Description,
            OfficeId = request.OfficeId,
            FiscalYearId = request.FiscalYearId,
            FundSourceId = request.FundSourceId,
            LIBId = request.LIBId,
            IsMaster = request.IsMaster,
            ConsolidatedIntoId = request.ConsolidatedIntoId,
            ParentId = request.ParentId,
            Version = version,
            TotalEstimatedBudget = 0,
            Status = ERPEZ.Domain.Enums.StatusEnum.Draft
        };

        await unitOfWork.PPMPRepository.AddAsync(ppmp, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(ppmp.Id, "PPMP created successfully.");
    }
}