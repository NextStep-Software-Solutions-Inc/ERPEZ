using System.Text.RegularExpressions;
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Domain.Entities.Planning;
using LibEntity = ERPEZ.Domain.Entities.Planning.LineItemBudget;

namespace ERPEZ.Application.Features.Planning.Document.Mappers;

public static class LibRealignmentMapper
{
    public static LibRealignmentPdfDataDto MapToLibRealignmentPdfDataDto(
        LIBAmendmentRequest amendment,
        LibEntity originalLib,
        LibEntity proposedLib,
        string? organizationName = null,
        string? agencyName = null,
        string? organizationCode = null)
    {
        var fiscalYear = originalLib.FiscalYearEntity?.Year.ToString()
            ?? proposedLib.FiscalYearEntity?.Year.ToString()
            ?? DateTime.UtcNow.Year.ToString();

        var resolvedOrgName = !string.IsNullOrWhiteSpace(organizationName)
            ? organizationName
            : (originalLib.Office?.Organization?.Name ?? proposedLib.Office?.Organization?.Name);

        var resolvedAgencyName = !string.IsNullOrWhiteSpace(agencyName)
            ? agencyName
            : (originalLib.Office?.Name ?? proposedLib.Office?.Name);

        var deliveryUnit = !string.IsNullOrWhiteSpace(originalLib.Office?.Name)
            ? originalLib.Office.Name
            : (!string.IsNullOrWhiteSpace(proposedLib.Office?.Name)
                ? proposedLib.Office.Name
                : (!string.IsNullOrWhiteSpace(resolvedAgencyName) ? resolvedAgencyName : "Delivery Unit"));

        var resolvedOrgCode = !string.IsNullOrWhiteSpace(organizationCode)
            ? organizationCode
            : (originalLib.Office?.Organization?.Code
                ?? proposedLib.Office?.Organization?.Code
                ?? originalLib.Office?.Code
                ?? proposedLib.Office?.Code);

        // If code is still empty, attempt to extract abbreviation from parentheses in org name (e.g., "State Universities and Colleges (SUCS)")
        if (string.IsNullOrWhiteSpace(resolvedOrgCode) && !string.IsNullOrWhiteSpace(resolvedOrgName))
        {
            var match = Regex.Match(resolvedOrgName, @"\(([^)]+)\)");
            if (match.Success)
            {
                resolvedOrgCode = match.Groups[1].Value.Trim();
            }
        }

        var cleanAgencyCode = !string.IsNullOrWhiteSpace(resolvedOrgCode)
            ? Regex.Replace(resolvedOrgCode.Trim().ToUpperInvariant(), @"[^A-Z0-9]", "")
            : "SUC";

        if (string.IsNullOrWhiteSpace(cleanAgencyCode) ||
            cleanAgencyCode.StartsWith("STATEUNIV", StringComparison.OrdinalIgnoreCase) ||
            cleanAgencyCode.Equals("SUCS", StringComparison.OrdinalIgnoreCase))
        {
            cleanAgencyCode = "SUC";
        }

        var documentCode = $"FM-{cleanAgencyCode}-FDP-002";

        string effectiveDate;
        if (string.Equals(amendment.Status, "Approved", StringComparison.OrdinalIgnoreCase))
        {
            var approvalDate = amendment.UpdatedAt ?? amendment.CreatedAt;
            effectiveDate = approvalDate != default ? approvalDate.ToString("MM-dd-yyyy") : DateTime.UtcNow.ToString("MM-dd-yyyy");
        }
        else
        {
            effectiveDate = "—";
        }

        var part2 = MapPart2(originalLib, proposedLib);
        var part3 = MapPart3(proposedLib, originalLib);

        return new LibRealignmentPdfDataDto
        {
            DocumentCode = documentCode,
            RevisionNo = "00",
            EffectiveDate = effectiveDate,
            FiscalYear = fiscalYear,
            OrganizationName = resolvedOrgName,
            AgencyName = resolvedAgencyName,
            DeliveryUnit = deliveryUnit,
            ReasonKey = amendment.Reason ?? string.Empty,
            Justification = amendment.Justification ?? string.Empty,
            Part2ApprovedBudget = part2,
            Part3ProposedModification = part3,
            Signatories = BuildDefaultSignatories(originalLib, proposedLib)
        };
    }

    private static LibRealignmentPart2Dto MapPart2(LibEntity originalLib, LibEntity proposedLib)
    {
        var (goal, prexc) = ResolveGoalAndPrexc(originalLib);

        var originalActivities = originalLib.LineItemBudgetActivities
            .Where(a => !a.IsDeleted)
            .ToList();

        var sourceActivities = new List<LibRealignmentActivityDto>();
        var mappedDetailIds = new HashSet<Guid>();

        // 1. Map all activities from the approved LIB
        foreach (var activity in originalActivities)
        {
            var actDetails = activity.LineItemBudgetDetails
                .Concat(originalLib.LineItemBudgetDetails.Where(d => d.LineItemBudgetActivityId == activity.Id))
                .DistinctBy(d => d.Id)
                .Where(d => !d.IsDeleted)
                .ToList();

            var mappedActivity = MapActivity(activity.Name, actDetails);
            if (mappedActivity.Items.Count > 0)
            {
                sourceActivities.Add(mappedActivity);
                foreach (var d in actDetails)
                {
                    mappedDetailIds.Add(d.Id);
                }
            }
        }

        // 2. Map all standalone or project-level details not attached to any mapped activity
        var standaloneDetails = originalLib.LineItemBudgetDetails
            .Where(d => !d.IsDeleted && !mappedDetailIds.Contains(d.Id))
            .DistinctBy(d => d.Id)
            .ToList();

        if (standaloneDetails.Count > 0)
        {
            var standaloneGroups = MapProjectGroups(standaloneDetails);
            sourceActivities.AddRange(standaloneGroups);
        }

        var totalQ1 = Math.Round(sourceActivities.Sum(a => a.SubTotalQ1), 2);
        var totalQ2 = Math.Round(sourceActivities.Sum(a => a.SubTotalQ2), 2);
        var totalQ3 = Math.Round(sourceActivities.Sum(a => a.SubTotalQ3), 2);
        var totalQ4 = Math.Round(sourceActivities.Sum(a => a.SubTotalQ4), 2);
        var grandTotal = Math.Round(sourceActivities.Sum(a => a.SubTotal), 2);

        return new LibRealignmentPart2Dto
        {
            Goal = goal,
            PrexcCodeAndTitle = prexc,
            Activities = sourceActivities,
            TotalQ1 = totalQ1,
            TotalQ2 = totalQ2,
            TotalQ3 = totalQ3,
            TotalQ4 = totalQ4,
            GrandTotal = grandTotal
        };
    }

    private static LibRealignmentPart3Dto MapPart3(LibEntity proposedLib, LibEntity originalLib)
    {
        var (goal, prexc) = ResolveGoalAndPrexc(proposedLib);
        if (string.IsNullOrWhiteSpace(goal) || goal == "Performance of Office Mandate")
        {
            var (origGoal, origPrexc) = ResolveGoalAndPrexc(originalLib);
            if (!string.IsNullOrWhiteSpace(origGoal)) goal = origGoal;
            if (!string.IsNullOrWhiteSpace(origPrexc)) prexc = origPrexc;
        }

        var proposedActivities = proposedLib.LineItemBudgetActivities
            .Where(a => !a.IsDeleted)
            .ToList();

        var mappedTargetActivities = new List<LibRealignmentActivityDto>();
        var mappedPropDetailIds = new HashSet<Guid>();

        // 1. Activity-scoped: Only include activities and items that have actually been modified or newly added
        foreach (var activity in proposedActivities)
        {
            var allActDetails = activity.LineItemBudgetDetails
                .Concat(proposedLib.LineItemBudgetDetails.Where(d => d.LineItemBudgetActivityId == activity.Id))
                .DistinctBy(d => d.Id)
                .Where(d => !d.IsDeleted)
                .ToList();

            foreach (var d in allActDetails)
            {
                mappedPropDetailIds.Add(d.Id);
            }

            var proposedActivityDto = MapActivity(activity.Name, allActDetails);

            // Find matching original activity
            var origActivity = originalLib.LineItemBudgetActivities
                .FirstOrDefault(a => !a.IsDeleted &&
                    string.Equals(a.Name?.Trim(), activity.Name?.Trim(), StringComparison.OrdinalIgnoreCase));

            if (origActivity == null)
            {
                // Entire activity is newly added
                if (proposedActivityDto.Items.Count > 0)
                {
                    mappedTargetActivities.Add(proposedActivityDto);
                }
                continue;
            }

            // Map original activity items
            var origActDetails = origActivity.LineItemBudgetDetails
                .Concat(originalLib.LineItemBudgetDetails.Where(d => d.LineItemBudgetActivityId == origActivity.Id))
                .DistinctBy(d => d.Id)
                .Where(d => !d.IsDeleted)
                .ToList();

            var origActivityDto = MapActivity(origActivity.Name, origActDetails);

            // Filter items: only keep modified or newly added items
            var modifiedItems = new List<LibRealignmentItemRowDto>();
            foreach (var propItem in proposedActivityDto.Items)
            {
                var origItem = origActivityDto.Items.FirstOrDefault(i =>
                    string.Equals(i.ItemOfExpenditure?.Trim(), propItem.ItemOfExpenditure?.Trim(), StringComparison.OrdinalIgnoreCase));

                if (origItem == null)
                {
                    // Newly added expenditure item
                    modifiedItems.Add(propItem);
                }
                else
                {
                    bool isModified = Math.Abs(propItem.Q1 - origItem.Q1) > 0.001m
                        || Math.Abs(propItem.Q2 - origItem.Q2) > 0.001m
                        || Math.Abs(propItem.Q3 - origItem.Q3) > 0.001m
                        || Math.Abs(propItem.Q4 - origItem.Q4) > 0.001m
                        || Math.Abs(propItem.Total - origItem.Total) > 0.001m;

                    if (isModified)
                    {
                        modifiedItems.Add(propItem);
                    }
                }
            }

            if (modifiedItems.Count > 0)
            {
                var subQ1 = Math.Round(modifiedItems.Sum(i => i.Q1), 2);
                var subQ2 = Math.Round(modifiedItems.Sum(i => i.Q2), 2);
                var subQ3 = Math.Round(modifiedItems.Sum(i => i.Q3), 2);
                var subQ4 = Math.Round(modifiedItems.Sum(i => i.Q4), 2);
                var subTotal = Math.Round(modifiedItems.Sum(i => i.Total), 2);

                mappedTargetActivities.Add(new LibRealignmentActivityDto
                {
                    ActivityName = activity.Name,
                    Items = modifiedItems,
                    SubTotalQ1 = subQ1,
                    SubTotalQ2 = subQ2,
                    SubTotalQ3 = subQ3,
                    SubTotalQ4 = subQ4,
                    SubTotal = subTotal
                });
            }
        }

        // 2. Standalone details for project-scoped budgets (only modified details)
        var standaloneProposedDetails = proposedLib.LineItemBudgetDetails
            .Where(d => !d.IsDeleted && !mappedPropDetailIds.Contains(d.Id))
            .DistinctBy(d => d.Id)
            .ToList();

        if (standaloneProposedDetails.Count > 0)
        {
            var standaloneOrigDetails = originalLib.LineItemBudgetDetails
                .Where(d => !d.IsDeleted && (d.LineItemBudgetActivityId == null || !originalLib.LineItemBudgetActivities.Any(a => !a.IsDeleted && a.Id == d.LineItemBudgetActivityId)))
                .DistinctBy(d => d.Id)
                .ToList();

            var propGroups = MapProjectGroups(standaloneProposedDetails);
            var origGroups = MapProjectGroups(standaloneOrigDetails);

            foreach (var propGroup in propGroups)
            {
                var origGroup = origGroups.FirstOrDefault(g =>
                    string.Equals(g.ActivityName?.Trim(), propGroup.ActivityName?.Trim(), StringComparison.OrdinalIgnoreCase));

                if (origGroup == null)
                {
                    mappedTargetActivities.Add(propGroup);
                    continue;
                }

                var modifiedItems = new List<LibRealignmentItemRowDto>();
                foreach (var propItem in propGroup.Items)
                {
                    var origItem = origGroup.Items.FirstOrDefault(i =>
                        string.Equals(i.ItemOfExpenditure?.Trim(), propItem.ItemOfExpenditure?.Trim(), StringComparison.OrdinalIgnoreCase));

                    if (origItem == null)
                    {
                        modifiedItems.Add(propItem);
                    }
                    else
                    {
                        bool isModified = Math.Abs(propItem.Q1 - origItem.Q1) > 0.001m
                            || Math.Abs(propItem.Q2 - origItem.Q2) > 0.001m
                            || Math.Abs(propItem.Q3 - origItem.Q3) > 0.001m
                            || Math.Abs(propItem.Q4 - origItem.Q4) > 0.001m
                            || Math.Abs(propItem.Total - origItem.Total) > 0.001m;

                        if (isModified)
                        {
                            modifiedItems.Add(propItem);
                        }
                    }
                }

                if (modifiedItems.Count > 0)
                {
                    var subQ1 = Math.Round(modifiedItems.Sum(i => i.Q1), 2);
                    var subQ2 = Math.Round(modifiedItems.Sum(i => i.Q2), 2);
                    var subQ3 = Math.Round(modifiedItems.Sum(i => i.Q3), 2);
                    var subQ4 = Math.Round(modifiedItems.Sum(i => i.Q4), 2);
                    var subTotal = Math.Round(modifiedItems.Sum(i => i.Total), 2);

                    mappedTargetActivities.Add(new LibRealignmentActivityDto
                    {
                        ActivityName = propGroup.ActivityName,
                        Items = modifiedItems,
                        SubTotalQ1 = subQ1,
                        SubTotalQ2 = subQ2,
                        SubTotalQ3 = subQ3,
                        SubTotalQ4 = subQ4,
                        SubTotal = subTotal
                    });
                }
            }
        }

        var targetActivityName = mappedTargetActivities.Count == 1
            ? mappedTargetActivities[0].ActivityName
            : string.Empty;

        var allItems = mappedTargetActivities.SelectMany(a => a.Items).ToList();

        var totalQ1 = Math.Round(mappedTargetActivities.Sum(a => a.SubTotalQ1), 2);
        var totalQ2 = Math.Round(mappedTargetActivities.Sum(a => a.SubTotalQ2), 2);
        var totalQ3 = Math.Round(mappedTargetActivities.Sum(a => a.SubTotalQ3), 2);
        var totalQ4 = Math.Round(mappedTargetActivities.Sum(a => a.SubTotalQ4), 2);
        var grandTotal = Math.Round(mappedTargetActivities.Sum(a => a.SubTotal), 2);

        return new LibRealignmentPart3Dto
        {
            Goal = goal,
            PrexcCodeAndTitle = prexc,
            TargetActivityName = targetActivityName,
            Activities = mappedTargetActivities,
            Items = allItems,
            TotalQ1 = totalQ1,
            TotalQ2 = totalQ2,
            TotalQ3 = totalQ3,
            TotalQ4 = totalQ4,
            ProposedGrandTotal = grandTotal
        };
    }

    private static LibRealignmentActivityDto MapActivity(string name, IEnumerable<LineItemBudgetDetail> details)
    {
        var items = details
            .GroupBy(ResolveActivityItemOfExpenditureName)
            .Select(g =>
            {
                var q1 = Math.Round(g.Sum(d => GetQuarterBudget(d, 1)), 2);
                var q2 = Math.Round(g.Sum(d => GetQuarterBudget(d, 2)), 2);
                var q3 = Math.Round(g.Sum(d => GetQuarterBudget(d, 3)), 2);
                var q4 = Math.Round(g.Sum(d => GetQuarterBudget(d, 4)), 2);
                var total = Math.Round(q1 + q2 + q3 + q4, 2);

                return new LibRealignmentItemRowDto
                {
                    ItemOfExpenditure = g.Key,
                    Q1 = q1,
                    Q2 = q2,
                    Q3 = q3,
                    Q4 = q4,
                    Total = total
                };
            }).ToList();

        var subTotalQ1 = Math.Round(items.Sum(i => i.Q1), 2);
        var subTotalQ2 = Math.Round(items.Sum(i => i.Q2), 2);
        var subTotalQ3 = Math.Round(items.Sum(i => i.Q3), 2);
        var subTotalQ4 = Math.Round(items.Sum(i => i.Q4), 2);
        var subTotal = Math.Round(items.Sum(i => i.Total), 2);

        return new LibRealignmentActivityDto
        {
            ActivityName = name,
            Items = items,
            SubTotalQ1 = subTotalQ1,
            SubTotalQ2 = subTotalQ2,
            SubTotalQ3 = subTotalQ3,
            SubTotalQ4 = subTotalQ4,
            SubTotal = subTotal
        };
    }

    private static List<LibRealignmentActivityDto> MapProjectGroups(IEnumerable<LineItemBudgetDetail> standaloneDetails)
    {
        return standaloneDetails
            .GroupBy(d => !string.IsNullOrWhiteSpace(d.Object?.Name)
                ? (!string.IsNullOrWhiteSpace(d.Object.Code) ? $"[{d.Object.Code}] {d.Object.Name}" : d.Object.Name)
                : "General Maintenance & Other Operating Expenses")
            .Select(group =>
            {
                var items = group
                    .GroupBy(d => !string.IsNullOrWhiteSpace(d.Description)
                        ? d.Description
                        : (!string.IsNullOrWhiteSpace(d.WFPObjectiveActivityExpenditure?.ItemDescription)
                            ? d.WFPObjectiveActivityExpenditure.ItemDescription
                            : (d.Object?.Name ?? "General Expense Item")))
                    .Select(g =>
                    {
                        var q1 = Math.Round(g.Sum(d => GetQuarterBudget(d, 1)), 2);
                        var q2 = Math.Round(g.Sum(d => GetQuarterBudget(d, 2)), 2);
                        var q3 = Math.Round(g.Sum(d => GetQuarterBudget(d, 3)), 2);
                        var q4 = Math.Round(g.Sum(d => GetQuarterBudget(d, 4)), 2);
                        var total = Math.Round(q1 + q2 + q3 + q4, 2);

                        return new LibRealignmentItemRowDto
                        {
                            ItemOfExpenditure = g.Key,
                            Q1 = q1,
                            Q2 = q2,
                            Q3 = q3,
                            Q4 = q4,
                            Total = total
                        };
                    }).ToList();

                var subTotalQ1 = Math.Round(items.Sum(i => i.Q1), 2);
                var subTotalQ2 = Math.Round(items.Sum(i => i.Q2), 2);
                var subTotalQ3 = Math.Round(items.Sum(i => i.Q3), 2);
                var subTotalQ4 = Math.Round(items.Sum(i => i.Q4), 2);
                var subTotal = Math.Round(items.Sum(i => i.Total), 2);

                return new LibRealignmentActivityDto
                {
                    ActivityName = group.Key,
                    Items = items,
                    SubTotalQ1 = subTotalQ1,
                    SubTotalQ2 = subTotalQ2,
                    SubTotalQ3 = subTotalQ3,
                    SubTotalQ4 = subTotalQ4,
                    SubTotal = subTotal
                };
            })
            .Where(a => a.Items.Count > 0)
            .ToList();
    }

    private static string ResolveActivityItemOfExpenditureName(LineItemBudgetDetail detail)
    {
        // For Activity-scoped items, the Item of Expenditure is the UACS Object name (e.g. Salaries and Wages, Advertising Expenses)
        if (!string.IsNullOrWhiteSpace(detail.Object?.Name))
        {
            return detail.Object.Name;
        }

        if (!string.IsNullOrWhiteSpace(detail.Description))
        {
            return detail.Description;
        }

        if (!string.IsNullOrWhiteSpace(detail.WFPObjectiveActivityExpenditure?.ItemDescription))
        {
            return detail.WFPObjectiveActivityExpenditure.ItemDescription;
        }

        return "Other Maintenance and Operating Expenses";
    }

    public static decimal GetQuarterBudget(LineItemBudgetDetail detail, int quarter)
    {
        if (detail.StartDate is null)
        {
            if (string.Equals(detail.TimelineType, "Quarterly", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(detail.TimelineType, "Monthly", StringComparison.OrdinalIgnoreCase))
            {
                return Math.Round(detail.Budget / 4m, 2);
            }

            var qVal = Math.Round(detail.Budget / 4m, 2);
            if (quarter < 4) return qVal;
            return detail.Budget - (qVal * 3);
        }

        var quarterNumber = (detail.StartDate.Value.Month - 1) / 3 + 1;
        return quarterNumber == quarter ? Math.Round(detail.Budget, 2) : 0m;
    }

    private static (string Goal, string Prexc) ResolveGoalAndPrexc(LibEntity lib)
    {
        var activityWithContext = lib.LineItemBudgetActivities
            .FirstOrDefault(a => !a.IsDeleted && (a.OPCRActivity != null || a.WFPObjectiveActivity != null))
            ?? lib.LineItemBudgetActivities.FirstOrDefault(a => !a.IsDeleted);

        var opcrItem = activityWithContext?.OPCRActivity?.OPCRItem;
        var fyActiveKpi = opcrItem?.KPIAssignment?.FYActiveKPI;
        var wfpObjective = activityWithContext?.WFPObjectiveActivity?.WFPObjective;

        var prexc = fyActiveKpi?.MFOPAP?.Name
            ?? fyActiveKpi?.Name
            ?? wfpObjective?.Description
            ?? "NEP: General Administration and Support (GAS) - General Management & Supervision";

        var goal = activityWithContext?.OPCRActivity?.Description
            ?? wfpObjective?.Outcome
            ?? "Performance of Office Mandate";

        return (goal, prexc);
    }

    public static List<LibRealignmentSignatoryDto> BuildDefaultSignatories(LibEntity? originalLib = null, LibEntity? proposedLib = null)
    {
        var officeName = originalLib?.Office?.Name ?? proposedLib?.Office?.Name;
        var submittedByDesignation = !string.IsNullOrWhiteSpace(officeName)
            ? $"Head, {officeName}"
            : "Head of Office / Delivery Unit Head";

        return
        [
            new LibRealignmentSignatoryDto
            {
                Order = 1,
                Role = "[1] Submitted by:",
                Name = string.Empty,
                Designation = submittedByDesignation
            },
            new LibRealignmentSignatoryDto
            {
                Order = 2,
                Role = "[2] Certified as to availability of budget:",
                Name = string.Empty,
                Designation = "Director, Financial Management Services"
            },
            new LibRealignmentSignatoryDto
            {
                Order = 3,
                Role = "[3] RECOMMENDING APPROVAL:",
                Name = string.Empty,
                Designation = "Chancellor"
            },
            new LibRealignmentSignatoryDto
            {
                Order = 4,
                Role = "[4] APPROVED:",
                Name = string.Empty,
                Designation = "President"
            }
        ];
    }
}
