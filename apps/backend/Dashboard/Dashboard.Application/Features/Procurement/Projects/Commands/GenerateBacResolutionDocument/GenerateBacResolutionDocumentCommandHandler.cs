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
using Microsoft.Extensions.Configuration;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.GenerateBacResolutionDocument;

public class BacResolutionWhereasClauseDto
{
    public string Name { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public int Order { get; set; }
}

public class BacMemberDto
{
    public string FullName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int Order { get; set; }
}

public class BacResolutionDataDto
{
    public string ResolutionNumber { get; set; } = string.Empty;
    public string ResolutionType { get; set; } = string.Empty;
    public DateTime DateResolved { get; set; }
    public string ResolvedLocation { get; set; } = string.Empty;
    public List<BacResolutionWhereasClauseDto> WhereasClauses { get; set; } = new();
    public string SourceType { get; set; } = string.Empty;
    public string PrNumber { get; set; } = string.Empty;
    public string ProjectTitle { get; set; } = string.Empty;
    public string OfficeName { get; set; } = string.Empty;
    public string ModeOfProcurement { get; set; } = string.Empty;
    public string SourceOfFund { get; set; } = string.Empty;
    public decimal ABC { get; set; }
    public string EndUserRepName { get; set; } = string.Empty;
    public string EndUserRepPosition { get; set; } = string.Empty;
    public string TechRepName { get; set; } = string.Empty;
    public string TechRepPosition { get; set; } = string.Empty;
    public List<BacMemberDto> BacMembers { get; set; } = new();
    public string HeadOfAgencyName { get; set; } = string.Empty;
    public string HeadOfAgencyTitle { get; set; } = string.Empty;
}

public class GenerateBacResolutionDocumentCommandHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService storageService,
    IConfiguration configuration)
    : IRequestHandler<GenerateBacResolutionDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateBacResolutionDocumentCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Fetch BAC Resolution entity
        var bacResolution = await unitOfWork.BACResolutionRepository
            .GetByIdAsync(request.BacResolutionId, cancellationToken)
            ?? throw new NotFoundException($"BAC Resolution with ID '{request.BacResolutionId}' was not found.");

        // 2. Fetch associated ProcurementProject
        var project = await unitOfWork.ProcurementProjectRepository
            .GetByIdAsync(bacResolution.ProcurementProjectId, cancellationToken)
            ?? throw new NotFoundException("Associated Procurement Project was not found.");

        var fullResolution = project.BACResolutions.FirstOrDefault(r => r.Id == request.BacResolutionId) ?? bacResolution;

        // 3. Hydrate source metadata
        string prNumber = "N/A";
        string officeName = "General Office";
        Guid officeId = Guid.Empty;
        string modeOfProcurement = project.ProcurementMode?.Name ?? "Public Bidding";
        string sourceOfFund = "General Appropriations Act (GAA)";

        if (project.SourceType == ProcurementProjectSourceType.APPItem && project.APPItemId.HasValue)
        {
            var appItem = await unitOfWork.APPItemRepository.GetWithDetailsAsync(project.APPItemId.Value, cancellationToken);
            if (appItem != null)
            {
                var appNum = (appItem.APP != null && !string.IsNullOrWhiteSpace(appItem.APP.APPNumber))
                    ? appItem.APP.APPNumber
                    : "APP";
                var itemNum = !string.IsNullOrWhiteSpace(appItem.PAPCode)
                    ? appItem.PAPCode
                    : appItem.Id.ToString()[..8];
                prNumber = $"{appNum} / {itemNum}";

                if (appItem.Office != null)
                {
                    officeName = appItem.Office.Name;
                    officeId = appItem.Office.Id;
                }
                else if (appItem.OfficeId != Guid.Empty)
                {
                    officeId = appItem.OfficeId;
                }
                if (appItem.ProcurementMode != null) modeOfProcurement = appItem.ProcurementMode.Name;
                if (appItem.FundSource != null) sourceOfFund = appItem.FundSource.Name;
            }
        }
        else if (project.SourceType == ProcurementProjectSourceType.ConsolidatedPR && project.ConsolidatedPRId.HasValue)
        {
            var cpr = await unitOfWork.ConsolidatedPRRepository.GetByIdAsync(project.ConsolidatedPRId.Value, cancellationToken);
            if (cpr != null)
            {
                prNumber = cpr.CPRNumber;
            }
        }

        // Fallback to first available Office in DB if officeId is empty
        if (officeId == Guid.Empty)
        {
            var defaultOffice = await unitOfWork.OfficeRepository.FindAsync(o => true, cancellationToken);
            if (defaultOffice != null)
            {
                officeId = defaultOffice.Id;
            }
        }

        // Hydrate WHEREAS clauses
        var whereasClauses = new List<BacResolutionWhereasClauseDto>();
        if (fullResolution.WhereasClauseItems != null && fullResolution.WhereasClauseItems.Any())
        {
            foreach (var item in fullResolution.WhereasClauseItems.OrderBy(i => i.Order))
            {
                var clause = item.BACResolutionWhereasClause ?? await unitOfWork.BACResolutionWhereasClauseRepository.GetByIdAsync(item.BACResolutionWhereasClauseId, cancellationToken);
                if (clause != null)
                {
                    whereasClauses.Add(new BacResolutionWhereasClauseDto
                    {
                        Name = clause.Name,
                        Body = clause.Body,
                        Order = item.Order
                    });
                }
            }
        }

        // Hydrate active BAC Members
        var bacMemberEntities = await unitOfWork.BACMemberRepository.FindAllAsync(m => m.IsActive, cancellationToken);
        var bacMembers = bacMemberEntities
            .OrderBy(m => m.Order)
            .Select(m => new BacMemberDto
            {
                FullName = m.FullName,
                Position = m.Position,
                Role = m.Role,
                Order = m.Order
            })
            .ToList();

        // Hydrate representatives
        var endUserRep = project.EndUserRepresentativeId.HasValue
            ? await unitOfWork.UserRepository.GetByIdAsync(project.EndUserRepresentativeId.Value, cancellationToken)
            : null;
        var techRep = project.TechRepresentativeId.HasValue
            ? await unitOfWork.UserRepository.GetByIdAsync(project.TechRepresentativeId.Value, cancellationToken)
            : null;

        var headOfAgencyName = configuration["BacDocument:HeadOfAgencyName"] ?? "DR. AMBROSIO B. CULTURA II";
        var headOfAgencyTitle = configuration["BacDocument:HeadOfAgencyTitle"] ?? "PRESIDENT, USTP-SYSTEM";

        var dataDto = new BacResolutionDataDto
        {
            ResolutionNumber = bacResolution.ResolutionNumber,
            ResolutionType = bacResolution.ResolutionType,
            DateResolved = bacResolution.DateResolved,
            ResolvedLocation = bacResolution.ResolvedLocation ?? string.Empty,
            WhereasClauses = whereasClauses,
            SourceType = project.SourceType.ToString(),
            PrNumber = prNumber,
            ProjectTitle = project.Title,
            OfficeName = officeName,
            ModeOfProcurement = modeOfProcurement,
            SourceOfFund = sourceOfFund,
            ABC = project.ABC,
            EndUserRepName = endUserRep?.FullName ?? project.EndUserRepresentative?.FullName ?? "Provisional Member, End-user Rep",
            EndUserRepPosition = "Provisional Member, End-user Rep",
            TechRepName = techRep?.FullName ?? project.TechRepresentative?.FullName ?? "Provisional Member, Tech Rep",
            TechRepPosition = "Provisional Member, Tech Rep",
            BacMembers = bacMembers,
            HeadOfAgencyName = headOfAgencyName,
            HeadOfAgencyTitle = headOfAgencyTitle
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
            OfficeId = officeId,
            SourceDocumentId = bacResolution.Id,
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
