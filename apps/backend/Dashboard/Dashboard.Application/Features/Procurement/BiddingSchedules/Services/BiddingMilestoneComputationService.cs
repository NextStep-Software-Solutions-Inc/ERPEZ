using System;
using System.Collections.Generic;
using System.Linq;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.BiddingSchedules.Services;

public static class BiddingMilestoneComputationService
{
    public static bool IsNonWorkingDay(DateOnly date, IEnumerable<PublicHoliday> holidays)
    {
        if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
        {
            return true;
        }

        return holidays.Any(h => h.Date == date);
    }

    public static DateOnly CalculateNextMilestoneDate(DateOnly previousDate, int minDaysFromPrevious, IEnumerable<PublicHoliday> holidays)
    {
        var candidate = previousDate.AddDays(minDaysFromPrevious);
        while (IsNonWorkingDay(candidate, holidays))
        {
            candidate = candidate.AddDays(1);
        }
        return candidate;
    }

    public static List<(ProcurementActivityType ActivityType, DateOnly ComputedDate)> ComputeMilestones(
        DateOnly ibPostingDate,
        IEnumerable<ProcurementActivityType> activityTypes,
        IEnumerable<PublicHoliday> holidays)
    {
        var orderedTypes = activityTypes.OrderBy(c => c.DisplayOrder).ToList();
        var results = new List<(ProcurementActivityType ActivityType, DateOnly ComputedDate)>();

        DateOnly previousDate = ibPostingDate;

        foreach (var actType in orderedTypes)
        {
            if (actType.DisplayOrder == 0 || actType.MilestoneKey == "ib-posting" || actType.SystemRole == ProcurementActivitySystemRole.AdvertisementPosting)
            {
                results.Add((actType, ibPostingDate));
                previousDate = ibPostingDate;
            }
            else
            {
                var minDays = actType.MinDays ?? 0;
                var computedDate = CalculateNextMilestoneDate(previousDate, minDays, holidays);
                results.Add((actType, computedDate));
                previousDate = computedDate;
            }
        }

        return results;
    }

    public static List<BiddingActivitySchedule> RecalculateCascade(
        List<BiddingActivitySchedule> milestones,
        int changedIndex,
        IEnumerable<ProcurementActivityType> activityTypes,
        IEnumerable<PublicHoliday> holidays)
    {
        var orderedMilestones = milestones.OrderBy(m => m.MilestoneOrder).ToList();
        var typeList = activityTypes.ToList();
        var keyMap = typeList.Where(t => !string.IsNullOrEmpty(t.MilestoneKey)).ToDictionary(t => t.MilestoneKey!);
        var idMap = typeList.ToDictionary(t => t.Id);

        for (int i = changedIndex + 1; i < orderedMilestones.Count; i++)
        {
            var previous = orderedMilestones[i - 1];
            // Effective date of previous: override date (StartDate) if edited, otherwise computed
            var previousEffectiveDate = DateOnly.FromDateTime(previous.StartDate);

            var current = orderedMilestones[i];
            ProcurementActivityType? matchedType = null;

            if (!string.IsNullOrEmpty(current.MilestoneKey) && keyMap.TryGetValue(current.MilestoneKey, out var byKey))
            {
                matchedType = byKey;
            }
            else if (current.ProcurementActivityTypeId != Guid.Empty && idMap.TryGetValue(current.ProcurementActivityTypeId, out var byId))
            {
                matchedType = byId;
            }

            if (matchedType != null)
            {
                var minDays = matchedType.MinDays ?? 0;
                var nextDate = CalculateNextMilestoneDate(previousEffectiveDate, minDays, holidays);
                var nextDateTime = DateTime.SpecifyKind(nextDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);

                current.StartDate = nextDateTime;
                current.EndDate = nextDateTime;
            }
        }

        return orderedMilestones;
    }
}
