using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.RolloverFiscalYear;

public class RolloverFiscalYearCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<RolloverFiscalYearCommand, ApiResponse<RolloverResultResponse>>
{
    public async Task<ApiResponse<RolloverResultResponse>> Handle(RolloverFiscalYearCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.SourceFiscalYearId, cancellationToken)
            ?? throw new NotFoundException($"Source Fiscal Year with ID {request.SourceFiscalYearId} not found.");

        _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.TargetFiscalYearId, cancellationToken)
            ?? throw new NotFoundException($"Target Fiscal Year with ID {request.TargetFiscalYearId} not found.");

        int fundSourcesCopied = 0;
        int mfopapsCopied = 0;
        int uacsCombinationsCopied = 0;
        int uacsSegmentYearsCopied = 0;

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            if (request.IncludeOrgStructure)
                fundSourcesCopied = await RolloverFundSourcesAsync(request, cancellationToken);

            if (request.IncludeRecurringExpenses)
                mfopapsCopied = await RolloverMFOPAPsAsync(request, cancellationToken);

            if (request.IncludeUACSLibrary)
                (uacsCombinationsCopied, uacsSegmentYearsCopied) = await RolloverUACSLibraryAsync(request, cancellationToken);

            await unitOfWork.SaveChangesAsync(cancellationToken);

        }, cancellationToken);

        var result = new RolloverResultResponse
        {
            FundSourcesCopied = fundSourcesCopied,
            MFOPAPsCopied = mfopapsCopied,
            UACSCombinationsCopied = uacsCombinationsCopied,
            UACSSegmentYearsCopied = uacsSegmentYearsCopied,
            TotalRecordsCopied = fundSourcesCopied + mfopapsCopied + uacsCombinationsCopied + uacsSegmentYearsCopied
        };

        return ApiResponse<RolloverResultResponse>.Success(result,
            $"Rollover completed successfully. {result.TotalRecordsCopied} record(s) copied.");
    }

    private async Task<int> RolloverFundSourcesAsync(RolloverFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var sources = await unitOfWork.FundSourceRepository.ToListAsync(
            unitOfWork.FundSourceRepository.Query(fs => fs.FiscalYearId == request.SourceFiscalYearId),
            cancellationToken);

        if (sources.Count == 0) return 0;

        // Build old → new ID map upfront for self-referential ParentId remapping
        var idMap = sources.ToDictionary(fs => fs.Id, _ => Guid.NewGuid());

        var newFundSources = sources.Select(fs => new Domain.Entities.Planning.FundSource
        {
            Id = idMap[fs.Id],
            ParentId = fs.ParentId.HasValue && idMap.TryGetValue(fs.ParentId.Value, out var mappedParentId)
                ? mappedParentId
                : null,
            Name = fs.Name,
            Code = fs.Code,
            Type = fs.Type,
            IsActive = fs.IsActive,
            FiscalYearId = request.TargetFiscalYearId
        }).ToList();

        await unitOfWork.FundSourceRepository.AddRangeAsync(newFundSources, cancellationToken);
        return newFundSources.Count;
    }

    private async Task<int> RolloverMFOPAPsAsync(RolloverFiscalYearCommand request, CancellationToken cancellationToken)
    {
        var sources = await unitOfWork.MFOPAPRepository.ToListAsync(
            unitOfWork.MFOPAPRepository.Query(m => m.FiscalYearId == request.SourceFiscalYearId),
            cancellationToken);

        if (sources.Count == 0) return 0;

        // Build old → new ID map upfront for self-referential ParentId remapping
        var idMap = sources.ToDictionary(m => m.Id, _ => Guid.NewGuid());

        var newMFOPAPs = sources.Select(m => new Domain.Entities.Planning.MFOPAP
        {
            Id = idMap[m.Id],
            ParentId = m.ParentId.HasValue && idMap.TryGetValue(m.ParentId.Value, out var mappedParentId)
                ? mappedParentId
                : null,
            Name = m.Name,
            Code = m.Code,
            Type = m.Type,
            IsActive = m.IsActive,
            FiscalYearId = request.TargetFiscalYearId
        }).ToList();

        await unitOfWork.MFOPAPRepository.AddRangeAsync(newMFOPAPs, cancellationToken);
        return newMFOPAPs.Count;
    }

    private async Task<(int CombinationsCopied, int SegmentYearsCopied)> RolloverUACSLibraryAsync(
        RolloverFiscalYearCommand request, CancellationToken cancellationToken)
    {
        int combinationsCopied = 0;
        int segmentYearsCopied = 0;

        // 1. Copy UACSCodeCombinations linked to source FY
        var sourceCombinations = await unitOfWork.UACSCodeCombinationRepository.ToListAsync(
            unitOfWork.UACSCodeCombinationRepository.Query(u => u.FiscalYearId == request.SourceFiscalYearId),
            cancellationToken);

        if (sourceCombinations.Count > 0)
        {
            var newCombinations = sourceCombinations.Select(c => new Domain.Entities.Planning.UACSCodeCombination
            {
                Id = Guid.NewGuid(),
                FundSourceId = c.FundSourceId,
                OrganizationId = c.OrganizationId,
                LocationId = c.LocationId,
                MFOPAPId = c.MFOPAPId,
                ObjectId = c.ObjectId,
                CombinationCode = c.CombinationCode,
                Description = c.Description,
                IsValid = c.IsValid,
                FiscalYearId = request.TargetFiscalYearId,
                EffectiveDate = c.EffectiveDate,
                ExpiryDate = c.ExpiryDate,
                IsActive = c.IsActive
            }).ToList();

            await unitOfWork.UACSCodeCombinationRepository.AddRangeAsync(newCombinations, cancellationToken);
            combinationsCopied = newCombinations.Count;
        }

        // 2. Copy UACSCodeSegmentFiscalYear associations for source FY → target FY
        var sourceSegmentFYs = await unitOfWork.UACSCodeSegmentFiscalYearRepository.ToListAsync(
            unitOfWork.UACSCodeSegmentFiscalYearRepository.Query(s => s.FiscalYearId == request.SourceFiscalYearId),
            cancellationToken);

        if (sourceSegmentFYs.Count > 0)
        {
            var newSegmentFYs = sourceSegmentFYs.Select(s => new Domain.Entities.Planning.UACSCodeSegmentFiscalYear
            {
                Id = Guid.NewGuid(),
                UACSCodeSegmentId = s.UACSCodeSegmentId,
                FiscalYearId = request.TargetFiscalYearId,
                EffectiveStartDate = s.EffectiveStartDate,
                EffectiveEndDate = s.EffectiveEndDate,
                IsActive = s.IsActive
            }).ToList();

            await unitOfWork.UACSCodeSegmentFiscalYearRepository.AddRangeAsync(newSegmentFYs, cancellationToken);
            segmentYearsCopied = newSegmentFYs.Count;
        }

        return (combinationsCopied, segmentYearsCopied);
    }
}
