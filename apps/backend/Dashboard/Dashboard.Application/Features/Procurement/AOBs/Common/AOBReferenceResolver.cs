using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Common;

public record AOBReferenceMetadata
{
    public string? RFQNumber { get; init; }
    public string? BacResolutionNumber { get; init; }
    public string? PRNumber { get; init; }
    public string? PAPCode { get; init; }
    public string? ApproverName { get; init; }
    public string? ApproverTitle { get; init; }
}

public static class AOBReferenceResolver
{
    public static async Task<AOBReferenceMetadata> ResolveAsync(
        IUnitOfWork unitOfWork,
        Guid aobId,
        Guid? approvedBy,
        IReadOnlyList<RFQ> rfqs,
        CancellationToken cancellationToken = default)
    {
        var primaryRfq = rfqs.FirstOrDefault();
        var allRfqItems = rfqs.SelectMany(r => r.RFQItems).Where(i => !i.IsDeleted).ToList();

        var rfqNumber = primaryRfq?.RFQNumber;

        var cprId = primaryRfq?.ConsolidatedPRId
            ?? allRfqItems.Select(i => i.CPRItem?.ConsolidatedPRId).FirstOrDefault(id => id.HasValue && id.Value != Guid.Empty);

        ProcurementProject? project = null;
        if (cprId.HasValue && cprId.Value != Guid.Empty)
        {
            project = await unitOfWork.ProcurementProjectRepository.Query()
                .AsNoTracking()
                .Include(p => p.BACResolutions.Where(r => !r.IsDeleted))
                .Include(p => p.ConsolidatedPR)
                .Include(p => p.APPItem)
                .Include(p => p.APPItemLinks.Where(l => !l.IsDeleted))
                    .ThenInclude(l => l.APPItem)
                .FirstOrDefaultAsync(p => p.ConsolidatedPRId == cprId.Value && p.Status != "Cancelled" && !p.IsDeleted, cancellationToken);
        }

        if (project == null && aobId != Guid.Empty)
        {
            var mapping = await unitOfWork.AOBProcurementProjectMappingRepository.Query()
                .AsNoTracking()
                .Include(m => m.ProcurementProject)
                    .ThenInclude(p => p.BACResolutions.Where(r => !r.IsDeleted))
                .Include(m => m.ProcurementProject)
                    .ThenInclude(p => p.ConsolidatedPR)
                .Include(m => m.ProcurementProject)
                    .ThenInclude(p => p.APPItem)
                .Include(m => m.ProcurementProject)
                    .ThenInclude(p => p.APPItemLinks.Where(l => !l.IsDeleted))
                        .ThenInclude(l => l.APPItem)
                .FirstOrDefaultAsync(m => m.AOBId == aobId && !m.IsDeleted, cancellationToken);

            project = mapping?.ProcurementProject;
        }

        var resolution = project?.BACResolutions
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefault(r => string.Equals(r.Status, "Approved", StringComparison.OrdinalIgnoreCase) || string.IsNullOrEmpty(r.Status))
            ?? project?.BACResolutions.OrderByDescending(r => r.CreatedAt).FirstOrDefault();

        var prNumber = primaryRfq?.ConsolidatedPR?.CPRNumber
            ?? project?.ConsolidatedPR?.CPRNumber
            ?? allRfqItems.Select(i => i.CPRItem?.ConsolidatedPR?.CPRNumber).FirstOrDefault(n => !string.IsNullOrWhiteSpace(n));

        var bacResolutionNumber = resolution?.ResolutionNumber;

        var papCode = project?.APPItem?.PAPCode
            ?? project?.APPItemLinks.Select(l => l.APPItem?.PAPCode).FirstOrDefault(c => !string.IsNullOrWhiteSpace(c));

        string? approverName = null;
        string? approverTitle = null;
        if (approvedBy.HasValue && approvedBy.Value != Guid.Empty)
        {
            var approverUser = await unitOfWork.UserRepository.Query()
                .Include(u => u.PersonnelPositions.Where(pp => pp.IsActive && !pp.IsDeleted))
                    .ThenInclude(pp => pp.Position)
                .FirstOrDefaultAsync(u => u.Id == approvedBy.Value, cancellationToken);

            if (approverUser != null)
            {
                if (!string.IsNullOrWhiteSpace(approverUser.FullName))
                {
                    approverName = approverUser.FullName;
                }
                var activePosition = approverUser.PersonnelPositions.FirstOrDefault()?.Position;
                if (!string.IsNullOrWhiteSpace(activePosition?.Title))
                {
                    approverTitle = activePosition.Title;
                }
            }
        }

        return new AOBReferenceMetadata
        {
            RFQNumber = rfqNumber,
            BacResolutionNumber = bacResolutionNumber,
            PRNumber = prNumber,
            PAPCode = papCode,
            ApproverName = approverName,
            ApproverTitle = approverTitle
        };
    }
}
