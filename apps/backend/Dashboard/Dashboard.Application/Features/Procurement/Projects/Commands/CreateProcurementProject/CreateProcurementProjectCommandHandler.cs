using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;

public class CreateProcurementProjectCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateProcurementProjectCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateProcurementProjectCommand request, CancellationToken cancellationToken)
    {
        string projectTitle = request.Title ?? string.Empty;
        decimal projectABC = request.ABC ?? 0;
        Guid? procurementModeId = null;

        if (request.SourceType == ProcurementProjectSourceType.APPItem)
        {
            if (!request.APPItemId.HasValue)
            {
                return ApiResponse<Guid>.Fail("APPItemId is required when SourceType is APPItem.");
            }

            var appItem = await unitOfWork.APPItemRepository.GetByIdAsync(request.APPItemId.Value, cancellationToken);
            if (appItem == null)
            {
                return ApiResponse<Guid>.Fail($"APP Item with ID '{request.APPItemId.Value}' was not found.");
            }

            // Duplicate protection check for APP Item
            var existingProject = await unitOfWork.ProcurementProjectRepository.FindAsync(
                p => p.APPItemId == request.APPItemId.Value && p.Status != "Cancelled",
                cancellationToken);

            if (existingProject != null)
            {
                return ApiResponse<Guid>.Fail("An active Procurement Project already exists for this APP Item.");
            }

            // Authoritative Hydration from DB
            projectTitle = !string.IsNullOrWhiteSpace(appItem.Remarks)
                ? appItem.Remarks
                : (appItem.PPMPItem != null && !string.IsNullOrWhiteSpace(appItem.PPMPItem.Name) ? appItem.PPMPItem.Name : (request.Title ?? "APP Procurement Project"));

            projectABC = appItem.EstimatedBudgetOverride.HasValue && appItem.EstimatedBudgetOverride.Value > 0
                ? appItem.EstimatedBudgetOverride.Value
                : (request.ABC ?? 0);

            procurementModeId = appItem.ProcurementModeId;
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

            // Authoritative Hydration from DB
            projectTitle = !string.IsNullOrWhiteSpace(consolidatedPr.Description)
                ? consolidatedPr.Description
                : (!string.IsNullOrWhiteSpace(consolidatedPr.CPRNumber) ? consolidatedPr.CPRNumber : (request.Title ?? "Consolidated PR Project"));

            projectABC = consolidatedPr.TotalAmount > 0 ? consolidatedPr.TotalAmount : (request.ABC ?? 0);
        }

        var project = new ProcurementProject
        {
            SourceType = request.SourceType,
            APPItemId = request.SourceType == ProcurementProjectSourceType.APPItem ? request.APPItemId : null,
            ConsolidatedPRId = request.SourceType == ProcurementProjectSourceType.ConsolidatedPR ? request.ConsolidatedPRId : null,
            Title = projectTitle,
            ABC = projectABC,
            ProcurementModeId = procurementModeId,
            Status = string.IsNullOrWhiteSpace(request.Status) ? "Draft" : request.Status,
            EndUserRepresentativeId = request.EndUserRepresentativeId,
            TechRepresentativeId = request.TechRepresentativeId
        };

        var resolution = new BACResolution
        {
            ResolutionType = string.IsNullOrWhiteSpace(request.ResolutionType) ? "Recommend Mode of Procurement" : request.ResolutionType,
            ResolutionNumber = request.ResolutionNumber,
            DateResolved = request.DateResolved,
            Status = "Draft",
            WhereasClause = request.WhereasClause
        };

        project.BACResolutions.Add(resolution);

        await unitOfWork.ProcurementProjectRepository.AddAsync(project, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(project.Id, "Procurement project and initial BAC Resolution created successfully.");
    }
}
