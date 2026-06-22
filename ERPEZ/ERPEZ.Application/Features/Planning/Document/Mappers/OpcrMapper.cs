// ERPEZ.Application/Features/Planning/Document/Mappers/OpcrMapper.cs
using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Features.Planning.Document.Dtos;
using OPCREntity            = ERPEZ.Domain.Entities.Planning.OPCR;
using OPCRItemEntity        = ERPEZ.Domain.Entities.Planning.OPCRItem;
using OPCRActivityEntity    = ERPEZ.Domain.Entities.Planning.OPCRActivity;
using OPCRItemRatingEntity  = ERPEZ.Domain.Entities.Planning.OPCRItemRating;
using RatingScaleLevelEntity = ERPEZ.Domain.Entities.Planning.RatingScaleLevel;

namespace ERPEZ.Application.Features.Planning.Document.Mappers;

internal static class OpcrMapper
{
    private static readonly string[] categoryOrder = ["Strategic", "Core", "Mandatory"];

    // Dimension constants — must match KPIMeasurement.Dimensions string values
    private const string dimQuantity   = "Quantity";
    private const string dimEfficiency = "Efficiency";
    private const string dimTimeliness = "Timeliness";

    // ── Entry point ───────────────────────────────────────────────────────────

    internal static OpcrDataDto MapToBaseDto(OPCREntity opcr, bool includeRatings)
    {
        var fiscalYear    = opcr.FiscalYear?.Year.ToString() ?? string.Empty;
        var periodCovered = BuildPeriodCovered(fiscalYear);

        var functionCategories = opcr.OPCRItems
            .Where(i => !i.IsDeleted && i.KPIAssignment?.FYActiveKPI is not null)
            .GroupBy(i => i.KPIAssignment!.FYActiveKPI!.FunctionCategory)
            .OrderBy(g =>
            {
                var idx = Array.IndexOf(categoryOrder, g.Key);
                return idx >= 0 ? idx : 99;
            })
            .Select(fcGroup =>
                MapFunctionCategory(opcr, fcGroup.Key, fcGroup.ToList(), includeRatings))
            .ToList();

        var totalBudget = opcr.OPCRItems
            .Where(i => !i.IsDeleted)
            .SelectMany(i => i.OPCRActivities.Where(a => !a.IsDeleted))
            .Sum(a => a.Budget);

        return new OpcrDataDto
        {
            OfficeName               = opcr.Office?.Name                   ?? string.Empty,
            OfficeCode               = opcr.Office?.Code                   ?? string.Empty,
            AgencyName               = opcr.Office?.Organization?.Name     ?? string.Empty,
            CommitmentPersonName     = opcr.CommitmentPersonName ?? string.Empty,
            CommitmentPersonPosition = opcr.CommitmentPersonPosition ?? string.Empty,
            FiscalYear               = fiscalYear,
            PeriodCovered            = periodCovered,
            RatingPeriod             = opcr.FiscalYear?.Year.ToString()    ?? string.Empty,
            IncludeRatings           = includeRatings,
            FunctionCategories       = functionCategories,
            TotalBudget              = totalBudget,
            Signatories              = includeRatings
                                        ? BuildRatingSignatories()
                                        : BuildProposedSignatories(opcr)
        };
    }

    // ── Function Category ─────────────────────────────────────────────────────

    private static OpcrFunctionCategoryDto MapFunctionCategory(
        OPCREntity opcr, string categoryKey,
        List<OPCRItemEntity> items, bool includeRatings)
    {
        // Percentage from FiscalYear.FunctionAllocations — matches by FunctionType string
        var allocation = opcr.FiscalYear?.FunctionAllocations
            .FirstOrDefault(fa =>
                fa.FunctionType.ToString()
                    .Equals(categoryKey, StringComparison.OrdinalIgnoreCase));

        return new OpcrFunctionCategoryDto
        {
            CategoryName = DisplayName(categoryKey),
            Percentage   = allocation?.Percentage ?? 0m,
            MFOGroups    = BuildMFOGroups(items, includeRatings)
        };
    }

    // ── MFO Groups ─────────────────────────────────────────────────────────────

    private static List<OpcrMFOGroupDto> BuildMFOGroups(
        List<OPCRItemEntity> items, bool includeRatings)
    {
        // Prefer MasterKPI.MFOPAP; fall back to FYActiveKPI.MFOPAP
        static Domain.Entities.Planning.MFOPAP? ResolveMFO(OPCRItemEntity i)
        {
            var fy = i.KPIAssignment!.FYActiveKPI!;
            return fy.MasterKPI?.MFOPAP ?? fy.MFOPAP;
        }

        var withMfo = items
            .Where(i => ResolveMFO(i) != null)
            .GroupBy(i => ResolveMFO(i)!.Id)
            .Select(g =>
            {
                var mfo = ResolveMFO(g.First())!;
                return new OpcrMFOGroupDto
                {
                    MFOCode = mfo.Code,
                    MFOName = mfo.Name,
                    MFOType = mfo.Type,
                    KpiRows = g.Select(i => MapKpiRow(i, includeRatings)).ToList()
                };
            })
            .ToList();

        // Items without any MFOPAP — grouped into a single unnamed group
        var withoutMfo = items
            .Where(i => ResolveMFO(i) == null)
            .Select(i => MapKpiRow(i, includeRatings))
            .ToList();

        if (withoutMfo.Count > 0)
        {
            withMfo.Add(new OpcrMFOGroupDto
            {
                MFOCode = string.Empty,
                MFOName = string.Empty,
                MFOType = string.Empty,
                KpiRows = withoutMfo
            });
        }

        return withMfo;
    }

    // ── KPI Row ───────────────────────────────────────────────────────────────

    private static OpcrKpiRowDto MapKpiRow(OPCRItemEntity item, bool includeRatings)
    {
        var fy        = item.KPIAssignment!.FYActiveKPI!;
        var masterKpi = fy.MasterKPI;

        // Col 1 — SDA/Goals/PREXC: from MasterKPI Attributes (PREXC type)
        // Falls back to empty string if no PREXC attribute exists
        var sdaAttr = masterKpi?.Attributes
            .FirstOrDefault(a =>
                a.Code?.Equals("PREXC", StringComparison.OrdinalIgnoreCase) == true ||
                a.Name?.Equals("PREXC", StringComparison.OrdinalIgnoreCase) == true);
        var sda = sdaAttr?.Name ?? string.Empty;

        // Targets — OPCRItem is authoritative; auto-populated from KPIAssignment on creation
        var q1    = FormatTarget(item.Q1Target, fy.MeasurementUnit);
        var q2    = FormatTarget(item.Q2Target, fy.MeasurementUnit);
        var q3    = FormatTarget(item.Q3Target, fy.MeasurementUnit);
        var q4    = FormatTarget(item.Q4Target, fy.MeasurementUnit);
        var total = FormatTarget(
            item.Q1Target + item.Q2Target + item.Q3Target + item.Q4Target,
            fy.MeasurementUnit);

        var row = new OpcrKpiRowDto
        {
            SDAGoalsPREXC        = sda,
            GadMeasure           = fy.IsGAD ? fy.GadMeasure : null,
            PerformanceIndicator = fy.Name,
            KpiCode              = fy.Code,
            Q1Target             = q1,
            Q2Target             = q2,
            Q3Target             = q3,
            Q4Target             = q4,
            TotalTarget          = total,
            Activities           = item.OPCRActivities
                                       .Where(a => !a.IsDeleted)
                                       .Select(MapActivity)
                                       .ToList()
        };

        if (!includeRatings) return row;

        // ── Ratings ───────────────────────────────────────────────────────
        var ratings = item.OPCRItemRatings.Where(r => !r.IsDeleted).ToList();

        row.ActualAccomplishment = item.ActualAccomplishment;
        row.QRating              = PivotRating(ratings, dimQuantity);
        row.ERating              = PivotRating(ratings, dimEfficiency);
        row.TRating              = PivotRating(ratings, dimTimeliness);

        var presentRatings = new[] { row.QRating, row.ERating, row.TRating }
            .Where(r => r.HasValue)
            .Select(r => r!.Value)
            .ToList();

        row.AveRating = presentRatings.Count > 0
            ? Math.Round(presentRatings.Average(), 2)
            : null;

        // Adjectival rating — match average against RatingScaleLevel ranges
        if (row.AveRating.HasValue)
        {
            var template = ratings
                .FirstOrDefault(r => r.FYActiveKPIMeasurement?.RatingScaleTemplate != null)
                ?.FYActiveKPIMeasurement?.RatingScaleTemplate;

            if (template?.RatingScaleLevels is { } levels)
                row.AdjectivalRating = DeriveAdjectival(row.AveRating.Value, levels);
        }

        row.PMTRemark = ratings
            .FirstOrDefault(r => !string.IsNullOrWhiteSpace(r.PMTRemark))
            ?.PMTRemark;

        return row;
    }

    // ── Activity ──────────────────────────────────────────────────────────────

    private static OpcrActivityRowDto MapActivity(OPCRActivityEntity activity) =>
        new()
        {
            ActivityName = activity.Name,
            Budget       = activity.Budget,
            Departments  = string.Join(", ",
                activity.OPCRPAPDepartments
                    .Where(d => !d.IsDeleted && d.Office != null)
                    .Select(d => d.Office!.Name))
        };

    // ── Rating helpers ─────────────────────────────────────────────────────────

    private static decimal? PivotRating(
        List<OPCRItemRatingEntity> ratings, string dimensionName)
    {
        var match = ratings.FirstOrDefault(r =>
            r.FYActiveKPIMeasurement?.Dimensions.Contains(dimensionName) == true);
        return match?.PMTRating;
    }

    private static string DeriveAdjectival(
        decimal average, List<RatingScaleLevelEntity> levels)
    {
        var matched = levels
            .Where(l => l.MinValue.HasValue && l.MaxValue.HasValue)
            .FirstOrDefault(l =>
                average >= l.MinValue!.Value &&
                average <= l.MaxValue!.Value);
        return matched?.Description ?? string.Empty;
    }

    // ── Signatories ────────────────────────────────────────────────────────────

    private static List<SignatoryDto> BuildProposedSignatories(OPCREntity opcr) =>
    [
        new SignatoryDto
        {
            Label       = "Submitted by:",
            PrintedName = opcr.CommitmentPersonName ?? string.Empty,
            Position    = opcr.CommitmentPersonPosition ?? string.Empty,
            Designation = opcr.Office?.Name ?? string.Empty,
            Date        = opcr.SubmittedDate
        },
        new SignatoryDto
        {
            Label       = "Recommending Approval:",
            PrintedName = string.Empty,
            Position    = string.Empty,
            Designation = "Concerned Campus Vice President/Chancellor",
            Date        = null
        },
        new SignatoryDto
        {
            Label       = "Approved by:",
            PrintedName = string.Empty,
            Position    = string.Empty,
            Designation = "President",
            Date        = opcr.ApprovedDate
        }
    ];

    private static List<SignatoryDto> BuildRatingSignatories() =>
    [
        new SignatoryDto { Label = "Assessed by:",     Designation = "Cluster Presiding Officer, PMT" },
        new SignatoryDto { Label = "Assisted by:",     Designation = "Member, PMT"                    },
        new SignatoryDto { Label = "Reviewed by:",     Designation = "PMT Chairman"                   },
        new SignatoryDto { Label = "Reviewed by:",     Designation = "PMT Co-Chairman"                },
        new SignatoryDto { Label = "Final Rating by:", Designation = "Head of the Agency"             }
    ];

    // ── Formatting ─────────────────────────────────────────────────────────────

    // Targets are decimal (non-nullable) — 0 is a valid value, no null check needed
    private static string FormatTarget(decimal value, string unit) =>
        unit.Equals("Percentage", StringComparison.OrdinalIgnoreCase)
            ? $"{value:N2}%"
            : $"{value:N2}";

    private static string BuildPeriodCovered(string fiscalYear) =>
        string.IsNullOrWhiteSpace(fiscalYear)
            ? string.Empty
            : $"January 1 to December 31, {fiscalYear}";

    private static string DisplayName(string categoryKey) => categoryKey switch
    {
        "Strategic"         => "Strategic Priority & Core Function",
        "StrategicPriority" => "Strategic Priority & Core Function",
        "Core"              => "Core Functions",
        "Mandatory"         => "Mandatory Support Functions",
        "MandatorySupport"  => "Mandatory Support Functions",
        _                   => categoryKey
    };
}