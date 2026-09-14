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
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.GenerateBacResolutionDocument;

public class BacResolutionClauseDto
{
    public string Name { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public int Order { get; set; }
}

public class BacResolutionWhereasClauseDto : BacResolutionClauseDto
{
}

public class BacMemberDto
{
    public string FullName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int Order { get; set; }
}

public class BacResolutionItemDetailDto
{
    public string ItemCode { get; set; } = string.Empty;
    public string PAPCode { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitCost { get; set; }
    public decimal TotalAmount { get; set; }
    public string OfficeName { get; set; } = string.Empty;
    public string ProcurementModeName { get; set; } = string.Empty;
}

public class BacResolutionGroupDto
{
    public string GroupTitle { get; set; } = string.Empty;
    public string ReferenceNumber { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public List<BacResolutionItemDetailDto> Items { get; set; } = new();
}

public class BacResolutionDataDto
{
    public string ResolutionNumber { get; set; } = string.Empty;
    public string ResolutionType { get; set; } = string.Empty;
    public DateTime DateResolved { get; set; }
    public string ResolvedLocation { get; set; } = string.Empty;
    public List<BacResolutionClauseDto> WhereasClauses { get; set; } = new();
    public List<BacResolutionClauseDto> NowThereforeClauses { get; set; } = new();
    public List<BacResolutionClauseDto> ResolvedClauses { get; set; } = new();
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
    public List<BacResolutionGroupDto> ItemGroups { get; set; } = new();
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
        // 1. Fetch BAC Resolution entity with clause links and whereas items
        var bacResolution = await unitOfWork.BACResolutionRepository.Query()
            .Include(r => r.ClauseLinks)
                .ThenInclude(l => l.ResolutionClause)
            .Include(r => r.WhereasClauseItems)
                .ThenInclude(i => i.BACResolutionWhereasClause)
            .FirstOrDefaultAsync(r => r.Id == request.BacResolutionId || r.ProcurementProjectId == request.BacResolutionId, cancellationToken);

        if (bacResolution == null)
        {
            var proj = await unitOfWork.ProcurementProjectRepository.Query()
                .Include(p => p.BACResolutions)
                    .ThenInclude(r => r.ClauseLinks)
                        .ThenInclude(l => l.ResolutionClause)
                .Include(p => p.BACResolutions)
                    .ThenInclude(r => r.WhereasClauseItems)
                        .ThenInclude(i => i.BACResolutionWhereasClause)
                .FirstOrDefaultAsync(p => p.Id == request.BacResolutionId, cancellationToken);

            if (proj != null && proj.BACResolutions.Any())
            {
                bacResolution = proj.BACResolutions.First();
            }
            else
            {
                throw new NotFoundException($"BAC Resolution with ID '{request.BacResolutionId}' was not found.");
            }
        }

        // 2. Fetch associated ProcurementProject with full relationships
        var project = await unitOfWork.ProcurementProjectRepository.Query()
            .Include(p => p.EndUserRepresentative)
            .Include(p => p.TechRepresentative)
            .Include(p => p.ProcurementMode)
            .Include(p => p.APPItem)
                .ThenInclude(ai => ai!.APP)
            .Include(p => p.APPItem)
                .ThenInclude(ai => ai!.PPMPItem)
            .Include(p => p.APPItem)
                .ThenInclude(ai => ai!.Office)
            .Include(p => p.APPItem)
                .ThenInclude(ai => ai!.ProcurementMode)
            .Include(p => p.APPItem)
                .ThenInclude(ai => ai!.FundSource)
            .Include(p => p.APPItemLinks)
                .ThenInclude(l => l.APPItem)
                    .ThenInclude(ai => ai.APP)
            .Include(p => p.APPItemLinks)
                .ThenInclude(l => l.APPItem)
                    .ThenInclude(ai => ai.PPMPItem)
            .Include(p => p.APPItemLinks)
                .ThenInclude(l => l.APPItem)
                    .ThenInclude(ai => ai.Office)
            .Include(p => p.APPItemLinks)
                .ThenInclude(l => l.APPItem)
                    .ThenInclude(ai => ai.ProcurementMode)
            .Include(p => p.APPItemLinks)
                .ThenInclude(l => l.APPItem)
                    .ThenInclude(ai => ai.FundSource)
            .Include(p => p.ConsolidatedPR)
                .ThenInclude(c => c!.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.PurchaseRequest)
                        .ThenInclude(pr => pr.Office)
            .Include(p => p.ConsolidatedPR)
                .ThenInclude(c => c!.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.PRItem)
                        .ThenInclude(pi => pi.PPMPItem)
            .Include(p => p.ConsolidatedPR)
                .ThenInclude(c => c!.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.ProcurementMode)
            .Include(p => p.BACResolutions)
                .ThenInclude(r => r.ClauseLinks)
                    .ThenInclude(l => l.ResolutionClause)
            .Include(p => p.BACResolutions)
                .ThenInclude(r => r.WhereasClauseItems)
                    .ThenInclude(i => i.BACResolutionWhereasClause)
            .FirstOrDefaultAsync(p => p.Id == bacResolution.ProcurementProjectId, cancellationToken)
            ?? throw new NotFoundException("Associated Procurement Project was not found.");

        var fullResolution = project.BACResolutions.FirstOrDefault(r => r.Id == bacResolution.Id) ?? bacResolution;

        // 3. Hydrate source metadata and nested item groups
        string prNumber = "N/A";
        string officeName = "General Office";
        Guid officeId = Guid.Empty;
        string modeOfProcurement = project.ProcurementMode?.Name ?? "Public Bidding";
        string sourceOfFund = "General Appropriations Act (GAA)";
        var itemGroups = new List<BacResolutionGroupDto>();

        if (project.SourceType == ProcurementProjectSourceType.APPItem)
        {
            var appItems = new List<APPItem>();
            if (project.APPItemLinks != null && project.APPItemLinks.Any())
            {
                appItems.AddRange(project.APPItemLinks.OrderBy(l => l.Order).Select(l => l.APPItem).Where(ai => ai != null));
            }
            else if (project.APPItem != null)
            {
                appItems.Add(project.APPItem);
            }
            else if (project.APPItemId.HasValue)
            {
                var fetchedAppItem = await unitOfWork.APPItemRepository.GetWithDetailsAsync(project.APPItemId.Value, cancellationToken);
                if (fetchedAppItem != null) appItems.Add(fetchedAppItem);
            }

            if (appItems.Any())
            {
                var first = appItems.First();
                if (first.Office != null)
                {
                    officeName = first.Office.Name;
                    officeId = first.Office.Id;
                }
                if (first.ProcurementMode != null) modeOfProcurement = first.ProcurementMode.Name;
                if (first.FundSource != null) sourceOfFund = first.FundSource.Name;

                var appNums = appItems
                    .Select(ai => ai.APP != null && !string.IsNullOrWhiteSpace(ai.APP.APPNumber) ? ai.APP.APPNumber : "APP")
                    .Distinct()
                    .ToList();
                prNumber = string.Join(", ", appNums);

                // Group by APP
                var groupedByApp = appItems.GroupBy(ai => ai.APP != null ? ai.APP.Id : Guid.Empty);
                foreach (var grp in groupedByApp)
                {
                    var repItem = grp.First();
                    var appNum = repItem.APP != null && !string.IsNullOrWhiteSpace(repItem.APP.APPNumber) ? repItem.APP.APPNumber : "APP";
                    var appTitle = repItem.APP != null && !string.IsNullOrWhiteSpace(repItem.APP.Name) ? repItem.APP.Name : "Annual Procurement Plan";

                    var groupDto = new BacResolutionGroupDto
                    {
                        GroupTitle = $"APP No. {appNum} — {appTitle}",
                        ReferenceNumber = appNum,
                        Subtitle = appTitle,
                        Subtotal = grp.Sum(ai => ai.EffectiveABC),
                        Items = grp.Select(ai => new BacResolutionItemDetailDto
                        {
                            ItemCode = !string.IsNullOrWhiteSpace(ai.PAPCode) ? ai.PAPCode : (ai.PPMPItem != null && !string.IsNullOrWhiteSpace(ai.PPMPItem.PAPCode) ? ai.PPMPItem.PAPCode : ai.Id.ToString()[..8]),
                            PAPCode = !string.IsNullOrWhiteSpace(ai.PAPCode) ? ai.PAPCode : (ai.PPMPItem != null && !string.IsNullOrWhiteSpace(ai.PPMPItem.PAPCode) ? ai.PPMPItem.PAPCode : string.Empty),
                            ItemName = ai.PPMPItem != null && !string.IsNullOrWhiteSpace(ai.PPMPItem.Name) ? ai.PPMPItem.Name : (ai.Remarks ?? "APP Item"),
                            Description = ai.PPMPItem != null && !string.IsNullOrWhiteSpace(ai.PPMPItem.Description) ? ai.PPMPItem.Description : (ai.Remarks ?? string.Empty),
                            Unit = ai.PPMPItem != null && !string.IsNullOrWhiteSpace(ai.PPMPItem.Unit) ? ai.PPMPItem.Unit : "lot",
                            Quantity = 1,
                            UnitCost = ai.EffectiveABC,
                            TotalAmount = ai.EffectiveABC,
                            OfficeName = ai.Office != null ? ai.Office.Name : officeName,
                            ProcurementModeName = ai.ProcurementMode != null ? ai.ProcurementMode.Name : (ai.PPMPItem != null && ai.PPMPItem.ProcurementMode != null ? ai.PPMPItem.ProcurementMode.Name : string.Empty)
                        }).ToList()
                    };
                    itemGroups.Add(groupDto);
                }
            }
        }
        else if (project.SourceType == ProcurementProjectSourceType.ConsolidatedPR)
        {
            ConsolidatedPR? cpr = project.ConsolidatedPR;
            if (cpr == null && project.ConsolidatedPRId.HasValue)
            {
                cpr = await unitOfWork.ConsolidatedPRRepository.Query()
                    .Include(c => c.ConsolidatedPRItems)
                        .ThenInclude(ci => ci.PurchaseRequest)
                            .ThenInclude(pr => pr.Office)
                    .Include(c => c.ConsolidatedPRItems)
                        .ThenInclude(ci => ci.PRItem)
                            .ThenInclude(pi => pi.PPMPItem)
                    .Include(c => c.ConsolidatedPRItems)
                        .ThenInclude(ci => ci.ProcurementMode)
                    .FirstOrDefaultAsync(c => c.Id == project.ConsolidatedPRId.Value, cancellationToken);
            }

            if (cpr != null)
            {
                prNumber = cpr.CPRNumber;

                if (cpr.ConsolidatedPRItems != null && cpr.ConsolidatedPRItems.Any())
                {
                    var firstItem = cpr.ConsolidatedPRItems.FirstOrDefault();
                    if (firstItem?.ProcurementMode != null)
                    {
                        modeOfProcurement = firstItem.ProcurementMode.Name;
                    }
                    if (firstItem?.PurchaseRequest?.Office != null)
                    {
                        officeName = firstItem.PurchaseRequest.Office.Name;
                        officeId = firstItem.PurchaseRequest.Office.Id;
                    }

                    // Group by PurchaseRequest
                    var groupedByPr = cpr.ConsolidatedPRItems
                        .GroupBy(ci => ci.PurchaseRequestId);

                    foreach (var grp in groupedByPr)
                    {
                        var pr = grp.First().PurchaseRequest;
                        var prNum = pr != null && !string.IsNullOrWhiteSpace(pr.PRNumber) ? pr.PRNumber : "PR";
                        var prOffice = pr?.Office?.Name ?? officeName;
                        var prPurpose = pr?.Purpose ?? pr?.Description ?? string.Empty;

                        var groupDto = new BacResolutionGroupDto
                        {
                            GroupTitle = $"Purchase Request No. {prNum} — {prOffice}",
                            ReferenceNumber = prNum,
                            Subtitle = prPurpose,
                            Subtotal = grp.Sum(ci => ci.PRItem != null ? ci.PRItem.Amount : 0),
                            Items = grp.Where(ci => ci.PRItem != null).Select(ci => new BacResolutionItemDetailDto
                            {
                                ItemCode = !string.IsNullOrWhiteSpace(ci.PRItem.StockNo) ? ci.PRItem.StockNo : (ci.PRItem.PPMPItem != null && !string.IsNullOrWhiteSpace(ci.PRItem.PPMPItem.PAPCode) ? ci.PRItem.PPMPItem.PAPCode : ci.PRItemId.ToString()[..8]),
                                ItemName = !string.IsNullOrWhiteSpace(ci.PRItem.Name) ? ci.PRItem.Name : "PR Item",
                                Description = ci.PRItem.Description ?? string.Empty,
                                Unit = ci.PRItem.PPMPItem != null && !string.IsNullOrWhiteSpace(ci.PRItem.PPMPItem.Unit) ? ci.PRItem.PPMPItem.Unit : "unit",
                                Quantity = ci.PRItem.RequestedQuantity > 0 ? ci.PRItem.RequestedQuantity : 1,
                                UnitCost = ci.PRItem.UnitCost > 0 ? ci.PRItem.UnitCost : (ci.PRItem.RequestedQuantity > 0 ? ci.PRItem.Amount / ci.PRItem.RequestedQuantity : ci.PRItem.Amount),
                                TotalAmount = ci.PRItem.Amount,
                                OfficeName = prOffice,
                                PAPCode = ci.PRItem.PPMPItem?.PAPCode ?? string.Empty,
                                ProcurementModeName = ci.ProcurementMode?.Name ?? string.Empty
                            }).ToList()
                        };
                        itemGroups.Add(groupDto);
                    }
                }
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

        // Hydrate representatives
        var endUserRep = project.EndUserRepresentativeId.HasValue
            ? await unitOfWork.UserRepository.GetByIdAsync(project.EndUserRepresentativeId.Value, cancellationToken)
            : null;
        var techRep = project.TechRepresentativeId.HasValue
            ? await unitOfWork.UserRepository.GetByIdAsync(project.TechRepresentativeId.Value, cancellationToken)
            : null;

        var endUserRepName = endUserRep?.FullName ?? project.EndUserRepresentative?.FullName ?? "Provisional Member, End-user Rep";
        var techRepName = techRep?.FullName ?? project.TechRepresentative?.FullName ?? "Provisional Member, Tech Rep";
        var dateFormatted = bacResolution.DateResolved != default
            ? bacResolution.DateResolved.ToString("dddd, MMMM dd, yyyy")
            : DateTime.Now.ToString("dddd, MMMM dd, yyyy");
        var resolvedLocation = !string.IsNullOrWhiteSpace(bacResolution.ResolvedLocation)
            ? bacResolution.ResolvedLocation
            : "Procuring Entity Premises";

        // Build dynamic placeholder replacement map
        var replacements = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        void AddToken(string key, string val) => replacements[key] = val;

        AddToken("ProjectTitle", project.Title);
        AddToken("ProjectName", project.Title);
        AddToken("Title", project.Title);
        AddToken("ABC", $"Php {project.ABC:N2}");
        AddToken("Amount", $"Php {project.ABC:N2}");
        AddToken("ApprovedBudget", $"Php {project.ABC:N2}");
        AddToken("PrNumber", prNumber);
        AddToken("PRNumber", prNumber);
        AddToken("ModeOfProcurement", modeOfProcurement);
        AddToken("ProcurementMode", modeOfProcurement);
        AddToken("ResolutionNumber", bacResolution.ResolutionNumber);
        AddToken("ResNo", bacResolution.ResolutionNumber);
        AddToken("ResolutionType", bacResolution.ResolutionType);
        AddToken("OfficeName", officeName);
        AddToken("Office", officeName);
        AddToken("SourceOfFund", sourceOfFund);
        AddToken("FundSource", sourceOfFund);
        AddToken("EndUserRepName", endUserRepName);
        AddToken("EndUserRep", endUserRepName);
        AddToken("EndUserRepPosition", "Provisional Member, End-user Rep");
        AddToken("TechRepName", techRepName);
        AddToken("TechRep", techRepName);
        AddToken("TechRepPosition", "Provisional Member, Tech Rep");
        AddToken("DateResolved", dateFormatted);
        AddToken("ResolvedLocation", resolvedLocation);
        AddToken("Location", resolvedLocation);

        // Hydrate clauses from ClauseLinks
        var whereasClauses = new List<BacResolutionClauseDto>();
        var nowThereforeClauses = new List<BacResolutionClauseDto>();
        var resolvedClauses = new List<BacResolutionClauseDto>();

        if (fullResolution.ClauseLinks != null && fullResolution.ClauseLinks.Any())
        {
            foreach (var link in fullResolution.ClauseLinks.OrderBy(l => l.Order))
            {
                var clause = link.ResolutionClause ?? await unitOfWork.ResolutionClauseRepository.GetByIdAsync(link.ResolutionClauseId, cancellationToken);
                if (clause != null)
                {
                    var interpolatedBody = InterpolatePlaceholders(clause.Body, replacements);
                    var dto = new BacResolutionClauseDto
                    {
                        Name = clause.Name,
                        Body = interpolatedBody,
                        Order = link.Order
                    };

                    var clauseType = link.ClauseType ?? clause.ClauseType ?? "Whereas";
                    if (string.Equals(clauseType, "Whereas", StringComparison.OrdinalIgnoreCase))
                    {
                        whereasClauses.Add(dto);
                    }
                    else if (string.Equals(clauseType, "NowTherefore", StringComparison.OrdinalIgnoreCase))
                    {
                        nowThereforeClauses.Add(dto);
                    }
                    else if (string.Equals(clauseType, "Resolved", StringComparison.OrdinalIgnoreCase))
                    {
                        resolvedClauses.Add(dto);
                    }
                }
            }
        }

        // Fallback: If whereasClauses is empty, check legacy WhereasClauseItems
        if (!whereasClauses.Any() && fullResolution.WhereasClauseItems != null && fullResolution.WhereasClauseItems.Any())
        {
            foreach (var item in fullResolution.WhereasClauseItems.OrderBy(i => i.Order))
            {
                var clause = item.BACResolutionWhereasClause ?? await unitOfWork.BACResolutionWhereasClauseRepository.GetByIdAsync(item.BACResolutionWhereasClauseId, cancellationToken);
                if (clause != null)
                {
                    var interpolatedBody = InterpolatePlaceholders(clause.Body, replacements);
                    whereasClauses.Add(new BacResolutionClauseDto
                    {
                        Name = clause.Name,
                        Body = interpolatedBody,
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

        var headOfAgencyName = configuration["BacDocument:HeadOfAgencyName"] ?? string.Empty;
        var headOfAgencyTitle = configuration["BacDocument:HeadOfAgencyTitle"] ?? "HEAD OF THE PROCURING ENTITY";

        var dataDto = new BacResolutionDataDto
        {
            ResolutionNumber = bacResolution.ResolutionNumber,
            ResolutionType = bacResolution.ResolutionType,
            DateResolved = bacResolution.DateResolved,
            ResolvedLocation = bacResolution.ResolvedLocation ?? string.Empty,
            WhereasClauses = whereasClauses,
            NowThereforeClauses = nowThereforeClauses,
            ResolvedClauses = resolvedClauses,
            SourceType = project.SourceType.ToString(),
            PrNumber = prNumber,
            ProjectTitle = project.Title,
            OfficeName = officeName,
            ModeOfProcurement = modeOfProcurement,
            SourceOfFund = sourceOfFund,
            ABC = project.ABC,
            EndUserRepName = endUserRepName,
            EndUserRepPosition = "Provisional Member, End-user Rep",
            TechRepName = techRepName,
            TechRepPosition = "Provisional Member, Tech Rep",
            BacMembers = bacMembers,
            HeadOfAgencyName = headOfAgencyName,
            HeadOfAgencyTitle = headOfAgencyTitle,
            ItemGroups = itemGroups
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

    private static string InterpolatePlaceholders(string input, Dictionary<string, string> replacements)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;

        return System.Text.RegularExpressions.Regex.Replace(
            input,
            @"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}",
            match =>
            {
                var key = match.Groups[1].Value;
                if (replacements.TryGetValue(key, out var replacement))
                {
                    return replacement;
                }
                return match.Value;
            },
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);
    }
}
