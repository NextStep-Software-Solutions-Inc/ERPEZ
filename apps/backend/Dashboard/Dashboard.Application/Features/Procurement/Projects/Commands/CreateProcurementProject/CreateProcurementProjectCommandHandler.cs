using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;

public class CreateProcurementProjectCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateProcurementProjectCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateProcurementProjectCommand request, CancellationToken cancellationToken)
    {
        Guid createdProjectId = Guid.Empty;

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var now = DateTime.UtcNow;
            var createdByStr = request.UserId != Guid.Empty ? request.UserId.ToString() : "System";

            var project = new ProcurementProject
            {
                SourceType = request.SourceType,
                APPItemId = request.APPItemId,
                ConsolidatedPRId = request.ConsolidatedPRId,
                Status = "Draft",
                EndUserRepresentativeId = request.EndUserRepresentativeId,
                TechRepresentativeId = request.TechRepresentativeId,
                ChecklistConfirmed = false,
                CreatedAt = now,
                CreatedBy = createdByStr
            };

            // 1. Resolve and snapshot metadata from the selected source
            if (request.SourceType == ProcurementProjectSourceType.AppItem)
            {
                var appItem = await unitOfWork.APPItemRepository.GetWithDetailsAsync(request.APPItemId!.Value, cancellationToken)
                    ?? throw new NotFoundException($"APP Item with ID {request.APPItemId} not found.");

                project.OfficeId = appItem.OfficeId;
                project.FundSourceId = appItem.FundSourceId;
                project.ProcurementModeId = appItem.ProcurementModeId;
                project.ABC = request.ABC ?? (appItem.PPMPItem != null
                    ? appItem.PPMPItem.UnitPrice * appItem.PPMPItem.PPMPItemAllocations.Sum(a => a.Quantity)
                    : 0m);
                project.Title = !string.IsNullOrWhiteSpace(request.Title)
                    ? request.Title
                    : (!string.IsNullOrWhiteSpace(appItem.PPMPItem?.Name) ? appItem.PPMPItem.Name : "Procurement Project");

                if (project.OfficeId == Guid.Empty)
                {
                    var fallbackOffice = await unitOfWork.OfficeRepository.FindAsync(o => !o.IsDeleted, cancellationToken);
                    project.OfficeId = fallbackOffice?.Id ?? Guid.Empty;
                }

                if (project.FundSourceId == Guid.Empty)
                {
                    var fallbackFund = await unitOfWork.FundSourceRepository.FindAsync(f => !f.IsDeleted, cancellationToken);
                    project.FundSourceId = fallbackFund?.Id ?? Guid.Empty;
                }
            }
            else // ConsolidatedPR
            {
                var cpr = await unitOfWork.ConsolidatedPRRepository.GetCPRWithDetailsAsync(request.ConsolidatedPRId!.Value, cancellationToken)
                    ?? throw new NotFoundException($"Consolidated PR with ID {request.ConsolidatedPRId} not found.");

                project.ABC = request.ABC ?? cpr.TotalAmount;
                project.Title = !string.IsNullOrWhiteSpace(request.Title)
                    ? request.Title
                    : (!string.IsNullOrWhiteSpace(cpr.Description) ? cpr.Description : "Consolidated Procurement Project");

                var firstItemMode = cpr.ConsolidatedPRItems.FirstOrDefault(i => i.ProcurementModeId.HasValue);
                project.ProcurementModeId = firstItemMode?.ProcurementModeId;

                var distinctOffices = cpr.ConsolidatedPRItems
                    .Where(i => i.PurchaseRequest != null)
                    .Select(i => i.PurchaseRequest.OfficeId)
                    .Distinct()
                    .ToList();
                var distinctFunds = cpr.ConsolidatedPRItems
                    .Where(i => i.PurchaseRequest != null)
                    .Select(i => i.PurchaseRequest.FundSourceId)
                    .Where(id => id.HasValue)
                    .Select(id => id!.Value)
                    .Distinct()
                    .ToList();

                if (distinctOffices.Any())
                {
                    project.OfficeId = distinctOffices.First();
                }
                else
                {
                    var fallbackOffice = await unitOfWork.OfficeRepository.FindAsync(o => !o.IsDeleted, cancellationToken);
                    project.OfficeId = fallbackOffice?.Id ?? Guid.Empty;
                }

                if (distinctFunds.Any())
                {
                    project.FundSourceId = distinctFunds.First();
                }
                else
                {
                    var fallbackFund = await unitOfWork.FundSourceRepository.FindAsync(f => !f.IsDeleted, cancellationToken);
                    project.FundSourceId = fallbackFund?.Id ?? Guid.Empty;
                }
            }

            // 2. Initialize the link BAC Resolution
            var dateResolvedUtc = request.DateResolved.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(request.DateResolved, DateTimeKind.Utc)
                : request.DateResolved.ToUniversalTime();

            var resolution = new BACResolution
            {
                ResolutionType = request.ResolutionType,
                ResolutionNumber = request.ResolutionNumber,
                DateResolved = dateResolvedUtc,
                ResolvedLocation = request.ResolvedLocation,
                Status = "Draft",
                WhereasClause = string.Empty, // Backward compatibility: concatenate below
                CreatedAt = now,
                CreatedBy = createdByStr
            };

            // 3. Process WHEREAS clauses (snapshot details & display order)
            var selectedClauses = new List<BACResolutionClause>();
            int order = 0;

            if (request.SelectedTemplateClauseIds != null)
            {
                foreach (var templateId in request.SelectedTemplateClauseIds)
                {
                    var template = await unitOfWork.BACResolutionWhereasClauseRepository.GetByIdAsync(templateId, cancellationToken)
                        ?? throw new NotFoundException($"WHEREAS Template Clause with ID {templateId} not found.");

                    selectedClauses.Add(new BACResolutionClause
                    {
                        TemplateClauseId = templateId,
                        ClauseText = template.Body,
                        DisplayOrder = order++,
                        IsCustom = false,
                        CreatedAt = now,
                        CreatedBy = createdByStr
                    });
                }
            }

            if (request.CustomClauses != null)
            {
                foreach (var customText in request.CustomClauses)
                {
                    if (string.IsNullOrWhiteSpace(customText)) continue;

                    selectedClauses.Add(new BACResolutionClause
                    {
                        TemplateClauseId = null,
                        ClauseText = customText,
                        DisplayOrder = order++,
                        IsCustom = true,
                        CreatedAt = now,
                        CreatedBy = createdByStr
                    });
                }
            }

            resolution.SelectedClauses = selectedClauses;

            // Concatenate whereas clauses to the legacy string field for backward compatibility
            resolution.WhereasClause = string.Join("\n\n", selectedClauses.Select(c => c.ClauseText));

            project.BACResolutions.Add(resolution);

            await unitOfWork.ProcurementProjectRepository.AddAsync(project, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            createdProjectId = project.Id;
        }, cancellationToken);

        return ApiResponse<Guid>.Success(createdProjectId, "Procurement project and initial BAC Resolution created successfully.");
    }
}
