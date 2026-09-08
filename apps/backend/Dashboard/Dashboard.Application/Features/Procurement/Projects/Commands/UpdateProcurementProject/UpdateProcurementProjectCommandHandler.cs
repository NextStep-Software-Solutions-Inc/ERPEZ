using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProject;

public class UpdateProcurementProjectCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateProcurementProjectCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateProcurementProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository
            .GetWithDetailsForUpdateAsync(request.Id, cancellationToken);

        if (project == null)
        {
            return ApiResponse<Unit>.Fail("Procurement project not found.");
        }

        if (!string.Equals(project.Status, nameof(StatusEnum.Draft), System.StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse<Unit>.Fail("Only procurement projects in 'Draft' status can be updated.");
        }

        if (request.UpdateRequest.Title != null)
        {
            project.Title = request.UpdateRequest.Title;
        }

        if (!string.IsNullOrEmpty(request.UpdateRequest.Status))
        {
            project.Status = request.UpdateRequest.Status;
        }

        project.EndUserRepresentativeId = request.UpdateRequest.EndUserRepresentativeId;
        project.TechRepresentativeId = request.UpdateRequest.TechRepresentativeId;

        // Append-only APP Items handling
        if (request.UpdateRequest.AppendAppItemIds?.Count > 0)
        {
            var existingLinks = project.APPItemLinks;
            var lockedAppId = existingLinks.FirstOrDefault()?.APPItem?.APPId
                ?? (project.APPItemId.HasValue
                    ? (await unitOfWork.APPItemRepository.GetByIdAsync(project.APPItemId.Value, cancellationToken))?.APPId
                    : null);

            var existingItemIds = existingLinks.Select(l => l.APPItemId).ToHashSet();
            if (project.APPItemId.HasValue) existingItemIds.Add(project.APPItemId.Value);

            int nextOrder = existingLinks.Count;
            foreach (var newItemId in request.UpdateRequest.AppendAppItemIds)
            {
                if (existingItemIds.Contains(newItemId)) continue;

                var appItem = await unitOfWork.APPItemRepository.GetWithDetailsAsync(newItemId, cancellationToken);
                if (appItem == null)
                {
                    return ApiResponse<Unit>.Fail($"APP Item with ID '{newItemId}' was not found.");
                }

                if (lockedAppId.HasValue && appItem.APPId != lockedAppId.Value)
                {
                    return ApiResponse<Unit>.Fail($"APP Item '{newItemId}' belongs to a different APP.");
                }

                project.APPItemLinks.Add(new ProcurementProjectAPPItem
                {
                    ProcurementProjectId = project.Id,
                    APPItemId = newItemId,
                    Order = nextOrder++
                });
                existingItemIds.Add(newItemId);
            }

            // Recalculate ABC
            var allItems = await unitOfWork.APPItemRepository.FindAllAsync(
                i => existingItemIds.Contains(i.Id), cancellationToken);
            project.ABC = allItems.Sum(i => i.EffectiveABC);
        }

        // Locate existing active resolution to update in-place
        BACResolution? resolution = null;

        if (!string.IsNullOrWhiteSpace(request.UpdateRequest.ResolutionNumber))
        {
            resolution = project.BACResolutions
                .FirstOrDefault(r => !r.IsDeleted && string.Equals(r.ResolutionNumber, request.UpdateRequest.ResolutionNumber, StringComparison.OrdinalIgnoreCase));
        }

        if (resolution == null && !string.IsNullOrWhiteSpace(request.UpdateRequest.ResolutionType))
        {
            resolution = project.BACResolutions
                .FirstOrDefault(r => !r.IsDeleted && string.Equals(r.ResolutionType, request.UpdateRequest.ResolutionType, StringComparison.OrdinalIgnoreCase));
        }

        if (resolution == null)
        {
            resolution = project.BACResolutions
                .Where(r => !r.IsDeleted)
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefault();
        }

        if (resolution != null)
        {
            // Update in-place preserving ID, CreatedAt, CreatedBy, and child foreign keys
            if (request.UpdateRequest.ResolutionType != null)
                resolution.ResolutionType = request.UpdateRequest.ResolutionType;
            if (request.UpdateRequest.ResolutionNumber != null)
                resolution.ResolutionNumber = request.UpdateRequest.ResolutionNumber;
            if (request.UpdateRequest.DateResolved.HasValue)
                resolution.DateResolved = request.UpdateRequest.DateResolved.Value.Kind == DateTimeKind.Unspecified
                    ? DateTime.SpecifyKind(request.UpdateRequest.DateResolved.Value, DateTimeKind.Utc)
                    : request.UpdateRequest.DateResolved.Value.ToUniversalTime();
            if (request.UpdateRequest.ResolvedLocation != null)
                resolution.ResolvedLocation = request.UpdateRequest.ResolvedLocation;
        }
        else if (!string.IsNullOrWhiteSpace(request.UpdateRequest.ResolutionNumber) || !string.IsNullOrWhiteSpace(request.UpdateRequest.ResolutionType))
        {
            // Only instantiate if project legitimately has no existing resolution
            resolution = new BACResolution
            {
                ProcurementProjectId = project.Id,
                ResolutionType = request.UpdateRequest.ResolutionType ?? "Recommend Mode of Procurement",
                ResolutionNumber = request.UpdateRequest.ResolutionNumber ?? string.Empty,
                DateResolved = request.UpdateRequest.DateResolved.HasValue
                    ? (request.UpdateRequest.DateResolved.Value.Kind == DateTimeKind.Unspecified
                        ? DateTime.SpecifyKind(request.UpdateRequest.DateResolved.Value, DateTimeKind.Utc)
                        : request.UpdateRequest.DateResolved.Value.ToUniversalTime())
                    : DateTime.UtcNow,
                ResolvedLocation = request.UpdateRequest.ResolvedLocation,
                Status = "Draft"
            };
            project.BACResolutions.Add(resolution);
        }

        if (resolution != null)
        {
            // Legacy Whereas clauses update
            if (request.UpdateRequest.WhereasClauses != null)
            {
                resolution.WhereasClauseItems.Clear();
                foreach (var clauseDto in request.UpdateRequest.WhereasClauses)
                {
                    var clause = await unitOfWork.BACResolutionWhereasClauseRepository.GetByIdAsync(clauseDto.WhereasClauseId, cancellationToken);
                    if (clause == null)
                    {
                        return ApiResponse<Unit>.Fail($"BAC Resolution Whereas Clause with ID '{clauseDto.WhereasClauseId}' was not found.");
                    }

                    resolution.WhereasClauseItems.Add(new BACResolutionWhereasClauseItem
                    {
                        BACResolutionId = resolution.Id,
                        BACResolutionWhereasClauseId = clauseDto.WhereasClauseId,
                        Order = clauseDto.Order
                    });
                }
            }

            // Generic Resolution Clauses update
            if (request.UpdateRequest.WhereasClauseLinks != null || request.UpdateRequest.NowThereforeClauses != null || request.UpdateRequest.ResolvedClauses != null)
            {
                resolution.ClauseLinks.Clear();
                var clauseGroups = new (string ClauseType, List<ResolutionClauseItemInputDto>? Clauses)[]
                {
                    ("Whereas", request.UpdateRequest.WhereasClauseLinks),
                    ("NowTherefore", request.UpdateRequest.NowThereforeClauses),
                    ("Resolved", request.UpdateRequest.ResolvedClauses)
                };

                foreach (var (clauseType, clauses) in clauseGroups)
                {
                    if (clauses == null || clauses.Count == 0) continue;

                    foreach (var item in clauses)
                    {
                        var clause = await unitOfWork.ResolutionClauseRepository.GetByIdAsync(item.ResolutionClauseId, cancellationToken);
                        if (clause == null)
                        {
                            return ApiResponse<Unit>.Fail($"Resolution Clause with ID '{item.ResolutionClauseId}' was not found.");
                        }

                        resolution.ClauseLinks.Add(new BACResolutionClauseLink
                        {
                            BACResolutionId = resolution.Id,
                            ResolutionClauseId = item.ResolutionClauseId,
                            ClauseType = clauseType,
                            Order = item.Order
                        });
                    }
                }
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement project updated successfully.");
    }
}

