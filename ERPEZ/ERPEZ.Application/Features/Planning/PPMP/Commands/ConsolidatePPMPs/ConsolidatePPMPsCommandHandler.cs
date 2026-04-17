using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.ConsolidatePPMPs;

public class ConsolidatePPMPsCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<ConsolidatePPMPsCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(ConsolidatePPMPsCommand request, CancellationToken cancellationToken)
    {
        Guid consolidatedPPMPId = Guid.Empty;
        
        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            // Validate all child PPMPs exist and are approved
            var childPPMPs = new List<Domain.Entities.Planning.PPMP>();
            foreach (var childId in request.ChildPPMPIds)
            {
                var childPPMP = await unitOfWork.PPMPRepository.GetPPMPWithDetailsAsync(childId, cancellationToken)
                    ?? throw new NotFoundException($"PPMP with ID {childId} not found.");

                if (childPPMP.Status != ERPEZ.Domain.Enums.StatusEnum.Approved)
                    throw new ValidationException($"PPMP {childPPMP.PPMPNumber} must be approved before consolidation.");

                if (childPPMP.ConsolidatedIntoId != null)
                    throw new ValidationException($"PPMP {childPPMP.PPMPNumber} is already consolidated.");

                childPPMPs.Add(childPPMP);
            }

            // Validate Office
            _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.ParentOfficeId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException($"Office with ID {request.ParentOfficeId} not found.");

            // Validate FiscalYear
            _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException($"Fiscal Year with ID {request.FiscalYearId} not found.");

            // Check uniqueness
            var existingPPMP = await unitOfWork.PPMPRepository.FindAsync(
                x => x.PPMPNumber == request.ConsolidatedPPMPNumber && x.FiscalYearId == request.FiscalYearId,
                cancellationToken
            );

            if (existingPPMP != null)
                throw new ConflictException("PPMP with the same number and fiscal year already exists.");

            // Calculate total budget
            var totalBudget = childPPMPs.Sum(p => p.TotalEstimatedBudget);

            // Derive FundSourceId and LIBId from first child PPMP (assuming all children have same values)
            var fundSourceId = childPPMPs.First().FundSourceId;
            var libId = childPPMPs.First().LIBId;

            // Create consolidated PPMP
            var consolidatedPPMP = new Domain.Entities.Planning.PPMP
            {
                PPMPNumber = request.ConsolidatedPPMPNumber,
                OfficeId = request.ParentOfficeId,
                FiscalYearId = request.FiscalYearId,
                FundSourceId = fundSourceId,
                LIBId = libId,
                Version = 1,
                TotalEstimatedBudget = totalBudget,
                Status = ERPEZ.Domain.Enums.StatusEnum.Approved,
                ApprovedDate = DateTime.UtcNow
            };

            await unitOfWork.PPMPRepository.AddAsync(consolidatedPPMP, cancellationToken);

            // Update child PPMPs to reference consolidated PPMP
            foreach (var childPPMP in childPPMPs)
            {
                childPPMP.ConsolidatedIntoId = consolidatedPPMP.Id;
                childPPMP.ParentId = consolidatedPPMP.Id;
                unitOfWork.PPMPRepository.Update(childPPMP);
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
            
            consolidatedPPMPId = consolidatedPPMP.Id;
        }, cancellationToken);

        return ApiResponse<Guid>.Success(consolidatedPPMPId, "PPMPs consolidated successfully.");
    }
}
