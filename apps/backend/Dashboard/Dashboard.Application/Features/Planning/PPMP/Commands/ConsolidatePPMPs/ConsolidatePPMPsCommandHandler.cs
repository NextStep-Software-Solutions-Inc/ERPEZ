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

            if (childPPMPs.Any(p => p.FiscalYearId != request.FiscalYearId))
                throw new ValidationException("All child PPMPs must belong to the specified fiscal year.");

            var distinctFundSourceIds = childPPMPs.Select(p => p.FundSourceId).Distinct().ToList();
            if (distinctFundSourceIds.Count != 1)
                throw new ValidationException("All child PPMPs must have the same fund source for consolidation.");

            var distinctLibIds = childPPMPs.Select(p => p.LIBId).Distinct().ToList();
            if (distinctLibIds.Count != 1)
                throw new ValidationException("All child PPMPs must have the same LIB for consolidation.");

            // Check uniqueness
            var existingPPMP = await unitOfWork.PPMPRepository.FindAsync(
                x => x.PPMPNumber == request.ConsolidatedPPMPNumber && x.FiscalYearId == request.FiscalYearId,
                cancellationToken
            );

            // Sum budgets of the child PPMPs in this request
            var childBudgetSum = childPPMPs.Sum(p => p.TotalEstimatedBudget);

            // Child PPMPs are already approved, so consolidated PPMP is marked approved by design.
            var fundSourceId = distinctFundSourceIds[0];
            var libId = distinctLibIds[0];

            Domain.Entities.Planning.PPMP consolidatedPPMP;
            if (existingPPMP != null)
            {
                if (!existingPPMP.IsMaster)
                    throw new ConflictException("PPMP with the same number and fiscal year already exists.");

                // Ensure existing master metadata matches the consolidation request
                if (existingPPMP.OfficeId != request.ParentOfficeId ||
                    existingPPMP.FundSourceId != fundSourceId ||
                    existingPPMP.LIBId != libId)
                {
                    throw new ConflictException("Existing master PPMP metadata does not match the consolidation request (OfficeId, FundSourceId, or LIBId mismatch). Please create a new consolidated PPMP number or choose a different master.");
                }

                consolidatedPPMP = existingPPMP;

                // Add budgets from the incoming child PPMPs to the existing master's budget
                consolidatedPPMP.TotalEstimatedBudget = (consolidatedPPMP.TotalEstimatedBudget) + childBudgetSum;
                consolidatedPPMP.Status = ERPEZ.Domain.Enums.StatusEnum.Approved;
                consolidatedPPMP.ApprovedDate = DateTime.UtcNow;

                unitOfWork.PPMPRepository.Update(consolidatedPPMP);
            }
            else
            {
                var totalBudget = childBudgetSum;

                consolidatedPPMP = new Domain.Entities.Planning.PPMP
                {
                    PPMPNumber = request.ConsolidatedPPMPNumber,
                    OfficeId = request.ParentOfficeId,
                    FiscalYearId = request.FiscalYearId,
                    FundSourceId = fundSourceId,
                    LIBId = libId,
                    Version = 1,
                    TotalEstimatedBudget = totalBudget,
                    Status = ERPEZ.Domain.Enums.StatusEnum.Approved,
                    ApprovedDate = DateTime.UtcNow,
                    IsFinal = true,
                    IsMaster = true
                };

                await unitOfWork.PPMPRepository.AddAsync(consolidatedPPMP, cancellationToken);
            }

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
