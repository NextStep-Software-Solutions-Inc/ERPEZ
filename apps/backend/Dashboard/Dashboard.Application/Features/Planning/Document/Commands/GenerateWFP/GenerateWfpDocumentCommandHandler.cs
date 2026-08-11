using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

using WfpEntity         = ERPEZ.Domain.Entities.Planning.WFP;
using ObjectiveEntity    = ERPEZ.Domain.Entities.Planning.WFPObjective;
using ActivityEntity     = ERPEZ.Domain.Entities.Planning.WFPObjectiveActivity;
using TimelineEntity     = ERPEZ.Domain.Entities.Planning.WFPObjectiveTimeline;
using GeneratedDocumentEntity = ERPEZ.Domain.Entities.Planning.GeneratedDocument;
using ERPEZ.Application.Common.Dtos;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateWFP;

public class GenerateWfpDocumentCommandHandler(
    IUnitOfWork              unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService  storageService)
    : IRequestHandler<GenerateWfpDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateWfpDocumentCommand request,
        CancellationToken          cancellationToken)
    {
        // ── 1. Fetch ─────────────────────────────────────────────────────────
        var wfp = await unitOfWork.WFPRepository
            .GetByIdWithDetailsAsync(request.WfpId, cancellationToken)
            ?? throw new NotFoundException("Work Plan (WFP) not found.");

        var orphanActivities = await unitOfWork.WFPRepository
            .GetOrphanActivitiesAsync(request.WfpId, cancellationToken);

        // ── 2. Map ───────────────────────────────────────────────────────────
        var dataDto = MapToWfpDataDto(wfp, orphanActivities);

        // ── 3. Render ────────────────────────────────────────────────────────
        var bytes = await rendererService.RenderAsync(
            dataDto, DocumentType.Wfp, request.Format, cancellationToken);

        // ── 4. Persist ───────────────────────────────────────────────────────
        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName  = $"WFP_{wfp.ProjectTitle.Replace(' ', '_')}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var path      = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        var record = new GeneratedDocumentEntity
        {
            DocumentType  = DocumentType.Wfp,
            Format        = request.Format,
            OfficeId      = wfp.OfficeId,
            StoragePath   = path,
            FileName      = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear    = wfp.ProjectStartDate.Year.ToString(),
            GeneratedBy   = request.GeneratedBy,
            CreatedAt     = DateTime.UtcNow
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "WFP document generated successfully.");
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Mapping
    // ═════════════════════════════════════════════════════════════════════════

    private static WfpDataDto MapToWfpDataDto(WfpEntity wfp, List<ActivityEntity> orphanActivities)
    {
        var objectiveDtos = wfp.WFPObjectives
            .OrderBy(o => o.Description) // no explicit ordering field on WFPObjective; stable fallback
            .Select(BuildObjectiveDto)
            .ToList();

        if (orphanActivities.Count > 0)
        {
            objectiveDtos.Add(new WfpObjectiveDto
            {
                ObjectiveText = string.Empty,
                Weight        = 0m,
                Activities    = orphanActivities.Select(BuildActivityDto).ToList()
            });
        }

        return new WfpDataDto
        {
            ProjectTitle     = wfp.ProjectTitle,
            ProjectOwner     = wfp.ProjectOwner ?? string.Empty,
            OfficeName       = BuildAgencyName(wfp),
            ProjectStartDate = wfp.ProjectStartDate,
            ProjectEndDate   = wfp.ProjectEndDate,
            DurationMonths   = CalculateDurationMonths(wfp.ProjectStartDate, wfp.ProjectEndDate),
            Objectives       = objectiveDtos,
            Signatories      = []
        };
    }

    private static WfpObjectiveDto BuildObjectiveDto(ObjectiveEntity objective)
    {
        var weightLabel = objective.Weight > 0
            ? $" ({objective.Weight:0.##}%)"
            : string.Empty;

        return new WfpObjectiveDto
        {
            ObjectiveText = $"{objective.Description}{weightLabel}",
            Weight        = objective.Weight,
            Activities    = objective.WFPObjectiveActivities
                .Select(BuildActivityDto)
                .ToList()
        };
    }

    private static WfpActivityDto BuildActivityDto(ActivityEntity activity)
    {
        var quarterValues = BuildQuarterValues(activity.WFPObjectiveTimelines);
        var total         = activity.WFPObjectiveTimelines.Sum(t => t.TargetValue);

        var accomplishmentLabel = activity.Weight > 0
            ? $"{activity.Indicator} ({activity.Weight:0.##}%)"
            : activity.Indicator;

        return new WfpActivityDto
        {
            GroupHeader           = null, // no source field yet — see open item
            TargetActivity        = activity.ActivityName,
            TargetAccomplishment  = accomplishmentLabel,
            Q1                    = FormatPercent(quarterValues.GetValueOrDefault(1)),
            Q2                    = FormatPercent(quarterValues.GetValueOrDefault(2)),
            Q3                    = FormatPercent(quarterValues.GetValueOrDefault(3)),
            Q4                    = FormatPercent(quarterValues.GetValueOrDefault(4)),
            Total                 = $"{total:0.##}%",
            WeightedPctTotal      = $"{activity.Weight:0.##}%"
        };
    }

    /// <summary>
    /// Buckets each timeline's TargetValue into its calendar quarter (derived from
    /// StartDate), matching LIB's GetQuarterBudget convention. Per confirmed scope,
    /// one timeline row always falls within a single quarter — no splitting needed.
    /// </summary>
    private static Dictionary<int, decimal> BuildQuarterValues(IEnumerable<TimelineEntity> timelines)
    {
        var result = new Dictionary<int, decimal>();

        foreach (var timeline in timelines)
        {
            var quarter = (timeline.StartDate.Month - 1) / 3 + 1;
            result[quarter] = result.GetValueOrDefault(quarter) + timeline.TargetValue;
        }

        return result;
    }

    private static string? FormatPercent(decimal value) =>
        value > 0 ? $"{value:0.##}%" : null;

    private static int CalculateDurationMonths(DateOnly start, DateOnly end)
    {
        var months = (end.Year - start.Year) * 12 + end.Month - start.Month;
        return Math.Max(months, 0);
    }

    private static string BuildAgencyName(WfpEntity wfp)
    {
        var parts = new[]
        {
            wfp.Office?.Name,
            wfp.Office?.Cluster?.Name,
            wfp.Office?.Organization?.Name
        };

        return string.Join(", ", parts.Where(p => !string.IsNullOrWhiteSpace(p)));
    }
}
