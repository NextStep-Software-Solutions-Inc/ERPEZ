using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.GenerateBacResolutionDocument;

public class BacResolutionDataDto
{
    public string ResolutionNumber { get; set; } = string.Empty;
    public string ResolutionType { get; set; } = string.Empty;
    public DateTime DateResolved { get; set; }
    public string WhereasClausesText { get; set; } = string.Empty;
    public string SourceType { get; set; } = string.Empty;
    public string SourceRef { get; set; } = string.Empty;
    public string ProjectTitle { get; set; } = string.Empty;
    public string OfficeName { get; set; } = string.Empty;
    public string ModeOfProcurement { get; set; } = string.Empty;
    public string SourceOfFund { get; set; } = string.Empty;
    public decimal ABC { get; set; }
    public string EndUserRepName { get; set; } = string.Empty;
    public string EndUserRepPosition { get; set; } = string.Empty;
    public string TechRepName { get; set; } = string.Empty;
    public string TechRepPosition { get; set; } = string.Empty;
    public string ChairpersonName { get; set; } = string.Empty;
}

public class GenerateBacResolutionDocumentCommandHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService storageService)
    : IRequestHandler<GenerateBacResolutionDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateBacResolutionDocumentCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Fetch BAC Resolution entity
        var bacResolution = await unitOfWork.BACResolutionRepository
            .FindAsync(r => r.Id == request.BacResolutionId, cancellationToken)
            ?? throw new NotFoundException($"BAC Resolution with ID '{request.BacResolutionId}' was not found.");

        // 2. Fetch associated ProcurementProject
        var project = await unitOfWork.ProcurementProjectRepository
            .GetByIdAsync(bacResolution.ProcurementProjectId, cancellationToken)
            ?? throw new NotFoundException("Associated Procurement Project was not found.");

        // 3. Hydrate source metadata
        string sourceRef = "N/A";
        string officeName = "General Office";
        string modeOfProcurement = project.ProcurementMode?.Name ?? "Public Bidding";
        string sourceOfFund = "General Appropriations Act (GAA)";

        if (project.SourceType == ProcurementProjectSourceType.APPItem && project.APPItemId.HasValue)
        {
            var appItem = await unitOfWork.APPItemRepository.GetByIdAsync(project.APPItemId.Value, cancellationToken);
            if (appItem != null)
            {
                sourceRef = $"APP-ITEM / {appItem.Id.ToString()[..8]}";
                if (appItem.Office != null) officeName = appItem.Office.Name;
                if (appItem.ProcurementMode != null) modeOfProcurement = appItem.ProcurementMode.Name;
                if (appItem.FundSource != null) sourceOfFund = appItem.FundSource.Name;
            }
        }
        else if (project.SourceType == ProcurementProjectSourceType.ConsolidatedPR && project.ConsolidatedPRId.HasValue)
        {
            var cpr = await unitOfWork.ConsolidatedPRRepository.GetByIdAsync(project.ConsolidatedPRId.Value, cancellationToken);
            if (cpr != null)
            {
                sourceRef = cpr.CPRNumber;
            }
        }

        var dataDto = new BacResolutionDataDto
        {
            ResolutionNumber = bacResolution.ResolutionNumber,
            ResolutionType = bacResolution.ResolutionType,
            DateResolved = bacResolution.DateResolved,
            WhereasClausesText = bacResolution.WhereasClause ?? string.Empty,
            SourceType = project.SourceType.ToString(),
            SourceRef = sourceRef,
            ProjectTitle = project.Title,
            OfficeName = officeName,
            ModeOfProcurement = modeOfProcurement,
            SourceOfFund = sourceOfFund,
            ABC = project.ABC,
            EndUserRepName = project.EndUserRepresentative?.FullName ?? "End-User Representative",
            EndUserRepPosition = "End-User Representative",
            TechRepName = project.TechRepresentative?.FullName ?? "Technical Representative",
            TechRepPosition = "Technical Representative",
            ChairpersonName = "BAC Chairperson"
        };

        // 4. Render document via IDocumentRendererService
        var bytes = await rendererService.RenderAsync(
            dataDto, DocumentType.BacResolution, request.Format, cancellationToken);

        // 5. Persist document content
        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName = $"BAC_Resolution_{bacResolution.ResolutionNumber}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var storagePath = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        var record = new GeneratedDocument
        {
            DocumentType = DocumentType.BacResolution,
            Format = request.Format,
            OfficeId = Guid.Empty,
            StoragePath = storagePath,
            FileName = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear = DateTime.UtcNow.Year.ToString(),
            GeneratedBy = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "BAC Resolution document generated successfully.");
    }
}
