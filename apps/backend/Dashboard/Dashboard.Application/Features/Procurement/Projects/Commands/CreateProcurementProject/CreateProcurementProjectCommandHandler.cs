using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;

public class CreateProcurementProjectCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateProcurementProjectCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateProcurementProjectCommand request, CancellationToken cancellationToken)
    {
        string projectTitle = request.Title ?? string.Empty;
        decimal projectABC = request.ABC ?? 0;
        Guid? procurementModeId = null;
        var appItems = new List<APPItem>();

        if (request.SourceType == ProcurementProjectSourceType.APPItem)
        {
            var itemIds = request.APPItemIds != null && request.APPItemIds.Count > 0
                ? request.APPItemIds.Distinct().ToList()
                : (request.APPItemId.HasValue ? new List<Guid> { request.APPItemId.Value } : new List<Guid>());

            var appIds = request.APPIds != null && request.APPIds.Count > 0
                ? request.APPIds.Distinct().ToList()
                : (request.APPId.HasValue ? new List<Guid> { request.APPId.Value } : new List<Guid>());

            if (itemIds.Count == 0)
            {
                return ApiResponse<Guid>.Fail("At least one APP Item is required when SourceType is APPItem.");
            }

            if (appIds.Count == 0)
            {
                return ApiResponse<Guid>.Fail("At least one APP is required when SourceType is APPItem.");
            }

            var apps = new List<APP>();
            foreach (var appId in appIds)
            {
                var app = await unitOfWork.APPRepository.GetByIdAsync(appId, cancellationToken);
                if (app == null)
                {
                    return ApiResponse<Guid>.Fail($"APP with ID '{appId}' was not found.");
                }
                apps.Add(app);
            }

            foreach (var id in itemIds)
            {
                var appItem = await unitOfWork.APPItemRepository.GetWithDetailsAsync(id, cancellationToken);
                if (appItem == null)
                {
                    return ApiResponse<Guid>.Fail($"APP Item with ID '{id}' was not found.");
                }

                if (!appIds.Contains(appItem.APPId))
                {
                    return ApiResponse<Guid>.Fail($"APP Item '{appItem.Id}' does not belong to any of the selected APPs.");
                }

                appItems.Add(appItem);
            }

            // Mode of Procurement Single-Mode validation under RA 12009
            var distinctModes = appItems
                .Select(i => i.ProcurementModeId)
                .Distinct()
                .ToList();

            if (distinctModes.Count > 1)
            {
                return ApiResponse<Guid>.Fail(
                    "All selected APP items must share the same Mode of Procurement. Under RA 12009, Competitive Bidding and Alternative Modes (e.g., SVP) cannot be combined in a single Procurement Project."
                );
            }

            // Duplicate protection check for all APP Items
            var existingProject = await unitOfWork.ProcurementProjectRepository
                .FindAsync(p => p.Status != "Cancelled" && (
                    (p.APPItemId.HasValue && itemIds.Contains(p.APPItemId.Value)) ||
                    p.APPItemLinks.Any(l => itemIds.Contains(l.APPItemId))
                ), cancellationToken);

            if (existingProject != null)
            {
                return ApiResponse<Guid>.Fail("An active Procurement Project already exists for one or more selected APP Items.");
            }

            // Authoritative Hydration from DB
            if (!string.IsNullOrWhiteSpace(request.Title))
            {
                projectTitle = request.Title;
            }
            else if (appItems.Count == 1)
            {
                var first = appItems[0];
                projectTitle = (first.PPMPItem != null && !string.IsNullOrWhiteSpace(first.PPMPItem.Name))
                    ? first.PPMPItem.Name
                    : (!string.IsNullOrWhiteSpace(first.Remarks) ? first.Remarks : "APP Procurement Project");
            }
            else
            {
                if (apps.Count == 1)
                {
                    var appNum = apps[0].APPNumber ?? "APP";
                    projectTitle = $"{appNum} - {appItems.Count} Items";
                }
                else
                {
                    projectTitle = $"Consolidated APP Project ({appItems.Count} Items)";
                }
            }

            decimal inheritedAbc = appItems.Sum(i => i.EffectiveABC);

            if (request.ABC.HasValue && request.ABC.Value > 0 && Math.Abs(Math.Round(request.ABC.Value, 2) - Math.Round(inheritedAbc, 2)) >= 0.01m)
            {
                return ApiResponse<Guid>.Fail($"Approved Budget (ABC) cannot be overridden. Provided: {request.ABC.Value:N2}, Expected: {inheritedAbc:N2}.");
            }

            projectABC = inheritedAbc;
            procurementModeId = distinctModes[0];
        }
        else if (request.SourceType == ProcurementProjectSourceType.ConsolidatedPR)
        {
            if (!request.ConsolidatedPRId.HasValue)
            {
                return ApiResponse<Guid>.Fail("ConsolidatedPRId is required when SourceType is ConsolidatedPR.");
            }

            var consolidatedPr = await unitOfWork.ConsolidatedPRRepository.GetByIdAsync(request.ConsolidatedPRId.Value, cancellationToken);
            if (consolidatedPr == null)
            {
                return ApiResponse<Guid>.Fail($"Consolidated PR with ID '{request.ConsolidatedPRId.Value}' was not found.");
            }

            // Duplicate protection check for Consolidated PR
            var existingProject = await unitOfWork.ProcurementProjectRepository.FindAsync(
                p => p.ConsolidatedPRId == request.ConsolidatedPRId.Value && p.Status != "Cancelled",
                cancellationToken);

            if (existingProject != null)
            {
                return ApiResponse<Guid>.Fail("An active Procurement Project already exists for this Consolidated PR.");
            }

            // Lineage duplicate protection: check if underlying APP items are already packaged in an active Route 1 Procurement Project
            var cprWithDetails = await unitOfWork.ConsolidatedPRRepository.GetCPRWithDetailsAsync(request.ConsolidatedPRId.Value, cancellationToken);
            if (cprWithDetails != null)
            {
                var distinctCprModes = cprWithDetails.ConsolidatedPRItems
                    .Where(ci => !ci.IsDeleted && ci.ProcurementModeId.HasValue)
                    .Select(ci => ci.ProcurementModeId!.Value)
                    .Distinct()
                    .ToList();

                if (distinctCprModes.Count > 0)
                {
                    procurementModeId = distinctCprModes[0];
                }

                var appItemIds = cprWithDetails.ConsolidatedPRItems
                    .Where(ci => !ci.IsDeleted)
                    .SelectMany(ci => ci.PRItem.PPMPItem?.APPItems ?? Enumerable.Empty<APPItem>())
                    .Where(ai => !ai.IsDeleted && (ai.APP == null || !ai.APP.IsDeleted))
                    .Select(ai => ai.Id)
                    .Distinct()
                    .ToList();

                if (appItemIds.Count > 0)
                {
                    var existingLineageProjects = await unitOfWork.ProcurementProjectRepository
                        .GetByAPPItemIdsWithResolutionsAsync(appItemIds, cancellationToken);

                    var existingLineageProject = existingLineageProjects.FirstOrDefault();
                    if (existingLineageProject != null)
                    {
                        var resolutionNum = existingLineageProject.BACResolutions.FirstOrDefault(r => !r.IsDeleted)?.ResolutionNumber;
                        var resolutionInfo = !string.IsNullOrEmpty(resolutionNum) ? $" (Resolution No. '{resolutionNum}')" : "";
                        return ApiResponse<Guid>.Fail($"Cannot create BAC Resolution: An active Procurement Project already exists for the items in this Consolidated PR under '{existingLineageProject.Title}'{resolutionInfo}.");
                    }
                }
            }

            // Authoritative Hydration from DB
            projectTitle = !string.IsNullOrWhiteSpace(consolidatedPr.Description)
                ? consolidatedPr.Description
                : (!string.IsNullOrWhiteSpace(consolidatedPr.CPRNumber) ? consolidatedPr.CPRNumber : (request.Title ?? "Consolidated PR Project"));

            decimal expectedCprAbc = consolidatedPr.TotalAmount;
            if (request.ABC.HasValue && request.ABC.Value > 0 && Math.Abs(Math.Round(request.ABC.Value, 2) - Math.Round(expectedCprAbc, 2)) >= 0.01m)
            {
                return ApiResponse<Guid>.Fail($"Approved Budget (ABC) cannot be overridden. Provided: {request.ABC.Value:N2}, Expected: {expectedCprAbc:N2}.");
            }

            projectABC = expectedCprAbc;
        }

        var project = new ProcurementProject
        {
            SourceType = request.SourceType,
            APPItemId = request.SourceType == ProcurementProjectSourceType.APPItem ? appItems.FirstOrDefault()?.Id : null,
            ConsolidatedPRId = request.SourceType == ProcurementProjectSourceType.ConsolidatedPR ? request.ConsolidatedPRId : null,
            Title = projectTitle,
            ABC = projectABC,
            ProcurementModeId = procurementModeId,
            Status = "Draft",
            EndUserRepresentativeId = request.EndUserRepresentativeId,
            TechRepresentativeId = request.TechRepresentativeId
        };

        if (request.SourceType == ProcurementProjectSourceType.APPItem && appItems.Count > 0)
        {
            for (int i = 0; i < appItems.Count; i++)
            {
                project.APPItemLinks.Add(new ProcurementProjectAPPItem
                {
                    APPItemId = appItems[i].Id,
                    Order = i
                });
            }
        }

        var resolution = new BACResolution
        {
            ResolutionType = string.IsNullOrWhiteSpace(request.ResolutionType) ? "Recommend Mode of Procurement" : request.ResolutionType,
            ResolutionNumber = request.ResolutionNumber,
            DateResolved = request.DateResolved.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(request.DateResolved, DateTimeKind.Utc)
                : request.DateResolved.ToUniversalTime(),
            ResolvedLocation = request.ResolvedLocation,
            Status = "Draft"
        };

        // Legacy Whereas clauses
        if (request.WhereasClauses != null && request.WhereasClauses.Count > 0)
        {
            foreach (var item in request.WhereasClauses)
            {
                var clause = await unitOfWork.BACResolutionWhereasClauseRepository.GetByIdAsync(item.WhereasClauseId, cancellationToken);
                if (clause == null)
                {
                    return ApiResponse<Guid>.Fail($"BAC Resolution Whereas Clause with ID '{item.WhereasClauseId}' was not found.");
                }

                resolution.WhereasClauseItems.Add(new BACResolutionWhereasClauseItem
                {
                    BACResolutionWhereasClauseId = item.WhereasClauseId,
                    Order = item.Order
                });
            }
        }

        // Generic Resolution Clauses (Whereas, NowTherefore, Resolved)
        var clauseGroups = new (string ClauseType, List<ResolutionClauseItemInputDto>? Clauses)[]
        {
            ("Whereas", request.WhereasClauseLinks),
            ("NowTherefore", request.NowThereforeClauses),
            ("Resolved", request.ResolvedClauses)
        };

        foreach (var (clauseType, clauses) in clauseGroups)
        {
            if (clauses == null || clauses.Count == 0) continue;

            foreach (var item in clauses)
            {
                var clause = await unitOfWork.ResolutionClauseRepository.GetByIdAsync(item.ResolutionClauseId, cancellationToken);
                if (clause == null)
                {
                    return ApiResponse<Guid>.Fail($"Resolution Clause with ID '{item.ResolutionClauseId}' was not found.");
                }

                resolution.ClauseLinks.Add(new BACResolutionClauseLink
                {
                    ResolutionClauseId = item.ResolutionClauseId,
                    ClauseType = clauseType,
                    Order = item.Order
                });
            }
        }

        project.BACResolutions.Add(resolution);

        await unitOfWork.ProcurementProjectRepository.AddAsync(project, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(project.Id, "Procurement project and initial BAC Resolution created successfully.");
    }
}

