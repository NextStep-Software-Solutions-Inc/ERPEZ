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
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProject;

public class UpdateProcurementProjectCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateProcurementProjectCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateProcurementProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository.Query()
            .Include(p => p.APPItemLinks)
                .ThenInclude(l => l.APPItem)
            .Include(p => p.BACResolutions)
                .ThenInclude(r => r.WhereasClauseItems)
            .Include(p => p.BACResolutions)
                .ThenInclude(r => r.ClauseLinks)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

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

        var resolution = project.BACResolutions.FirstOrDefault();
        if (resolution == null)
        {
            resolution = new BACResolution
            {
                ResolutionType = request.UpdateRequest.ResolutionType ?? string.Empty,
                ResolutionNumber = request.UpdateRequest.ResolutionNumber ?? string.Empty,
                DateResolved = request.UpdateRequest.DateResolved ?? DateTime.UtcNow,
                ResolvedLocation = request.UpdateRequest.ResolvedLocation
            };
            project.BACResolutions.Add(resolution);
        }
        else
        {
            if (request.UpdateRequest.ResolutionType != null)
                resolution.ResolutionType = request.UpdateRequest.ResolutionType;
            if (request.UpdateRequest.ResolutionNumber != null)
                resolution.ResolutionNumber = request.UpdateRequest.ResolutionNumber;
            if (request.UpdateRequest.DateResolved.HasValue)
                resolution.DateResolved = request.UpdateRequest.DateResolved.Value;
            if (request.UpdateRequest.ResolvedLocation != null)
                resolution.ResolvedLocation = request.UpdateRequest.ResolvedLocation;
        }

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

        unitOfWork.ProcurementProjectRepository.Update(project);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement project updated successfully.");
    }
}

