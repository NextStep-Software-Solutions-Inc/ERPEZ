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
            _ = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.LIBId.Value, cancellationToken: cancellationToken)
                ?? throw new NotFoundException($"Line Item Budget with ID {request.LIBId.Value} not found.");
        }

        var version = 1;

        // Validate Parent PPMP if provided. Creating with a parent means amendment.
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
            throw new ConflictException("PPMP with the same number, fiscal year, and version already exists.");

        var ppmp = new Domain.Entities.Planning.PPMP
        {
            PPMPNumber = request.PPMPNumber,
            OfficeId = request.OfficeId,
            FiscalYearId = request.FiscalYearId,
            FundSourceId = request.FundSourceId.HasValue ? request.FundSourceId.Value : Guid.Empty,
            LIBId = request.LIBId.HasValue ? request.LIBId.Value : Guid.Empty,
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
