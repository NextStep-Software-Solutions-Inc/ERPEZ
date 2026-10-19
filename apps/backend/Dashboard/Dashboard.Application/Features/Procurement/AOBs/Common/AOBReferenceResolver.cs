using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Common.Helpers;
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
    public string? EndUserRepName { get; init; }
    public string? TechRepName { get; init; }
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
        if (cprId.HasValue && cprId.Value != Guid.Empty && unitOfWork.ProcurementProjectRepository != null)
        {
            var projQuery = unitOfWork.ProcurementProjectRepository.Query();
            if (projQuery != null)
            {
                try
                {
                    project = await projQuery
                        .AsNoTracking()
                        .Include(p => p.BACResolutions.Where(r => !r.IsDeleted))
                        .Include(p => p.ConsolidatedPR)
                        .Include(p => p.APPItem)
                        .Include(p => p.EndUserRepresentative)
                        .Include(p => p.TechRepresentative)
                        .Include(p => p.APPItemLinks.Where(l => !l.IsDeleted))
                            .ThenInclude(l => l.APPItem)
                        .FirstOrDefaultAsync(p => p.ConsolidatedPRId == cprId.Value && p.Status != "Cancelled" && !p.IsDeleted, cancellationToken);
                }
                catch (InvalidOperationException)
                {
                    project = projQuery.FirstOrDefault(p => p.ConsolidatedPRId == cprId.Value && p.Status != "Cancelled" && !p.IsDeleted);
                }
            }
            project ??= await unitOfWork.ProcurementProjectRepository.FindAsync(
                p => p.ConsolidatedPRId == cprId.Value && p.Status != "Cancelled" && !p.IsDeleted,
                cancellationToken);
        }

        if (project == null && aobId != Guid.Empty && unitOfWork.AOBProcurementProjectMappingRepository != null)
        {
            var mapQuery = unitOfWork.AOBProcurementProjectMappingRepository.Query();
            AOBProcurementProjectMapping? mapping = null;
            if (mapQuery != null)
            {
                try
                {
                    mapping = await mapQuery
                        .AsNoTracking()
                        .Include(m => m.ProcurementProject)
                            .ThenInclude(p => p.BACResolutions.Where(r => !r.IsDeleted))
                        .Include(m => m.ProcurementProject)
                            .ThenInclude(p => p.ConsolidatedPR)
                        .Include(m => m.ProcurementProject)
                            .ThenInclude(p => p.APPItem)
                        .Include(m => m.ProcurementProject)
                            .ThenInclude(p => p.EndUserRepresentative)
                        .Include(m => m.ProcurementProject)
                            .ThenInclude(p => p.TechRepresentative)
                        .Include(m => m.ProcurementProject)
                            .ThenInclude(p => p.APPItemLinks.Where(l => !l.IsDeleted))
                                .ThenInclude(l => l.APPItem)
                        .FirstOrDefaultAsync(m => m.AOBId == aobId && !m.IsDeleted, cancellationToken);
                }
                catch (InvalidOperationException)
                {
                    mapping = mapQuery.FirstOrDefault(m => m.AOBId == aobId && !m.IsDeleted);
                }
            }
            mapping ??= await unitOfWork.AOBProcurementProjectMappingRepository.FindAsync(
                m => m.AOBId == aobId && !m.IsDeleted,
                cancellationToken);

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

        var resolvedApprover = await DocumentSignatoryResolver
            .ResolveUserSignatoryAsync(unitOfWork, approvedBy, cancellationToken);

        if (resolvedApprover == null || string.IsNullOrWhiteSpace(resolvedApprover.FullName))
        {
            var projectOfficeId = project?.APPItem?.OfficeId
                ?? project?.APPItemLinks.Select(l => l.APPItem?.OfficeId).FirstOrDefault(id => id.HasValue && id.Value != Guid.Empty);
            var wf = await DocumentSignatoryResolver
                .ResolveWorkflowApproversAsync(unitOfWork, projectOfficeId, null, null, cancellationToken);
            resolvedApprover = wf.FinalApprover ?? resolvedApprover;
        }

        if (resolvedApprover != null)
        {
            if (!string.IsNullOrWhiteSpace(resolvedApprover.FullName))
                approverName = resolvedApprover.FullName;
            if (!string.IsNullOrWhiteSpace(resolvedApprover.PositionTitle))
                approverTitle = resolvedApprover.PositionTitle;
        }

        var endUserRepName = project?.EndUserRepresentative?.FullName;
        if (string.IsNullOrWhiteSpace(endUserRepName) && project?.EndUserRepresentativeId.HasValue == true)
        {
            var endUser = await DocumentSignatoryResolver
                .ResolveUserSignatoryAsync(unitOfWork, project.EndUserRepresentativeId, cancellationToken);
            endUserRepName = endUser?.FullName;
        }

        var techRepName = project?.TechRepresentative?.FullName;
        if (string.IsNullOrWhiteSpace(techRepName) && project?.TechRepresentativeId.HasValue == true)
        {
            var techUser = await DocumentSignatoryResolver
                .ResolveUserSignatoryAsync(unitOfWork, project.TechRepresentativeId, cancellationToken);
            techRepName = techUser?.FullName;
        }

        return new AOBReferenceMetadata
        {
            RFQNumber = rfqNumber,
            BacResolutionNumber = bacResolutionNumber,
            PRNumber = prNumber,
            PAPCode = papCode,
            ApproverName = approverName,
            ApproverTitle = approverTitle,
            EndUserRepName = endUserRepName,
            TechRepName = techRepName
        };
    }
}
