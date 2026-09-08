using System;
using System.Collections.Generic;
using System.Linq;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Utils;

public static class NoticeOfAwardSlaCalculator
{
    private static readonly TimeZoneInfo philippineTimeZone = GetPhilippineTimeZone();

    private static TimeZoneInfo GetPhilippineTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Singapore Standard Time");
        }
        catch
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("Asia/Manila");
            }
            catch
            {
                return TimeZoneInfo.CreateCustomTimeZone("PST", TimeSpan.FromHours(8), "Philippine Standard Time", "Philippine Standard Time");
            }
        }
    }

    public static DateOnly ToPhilippineDate(DateTime utcDateTime)
    {
        var phTime = TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, philippineTimeZone);
        return DateOnly.FromDateTime(phTime);
    }

    public static NoticeOfAwardSlaStateDto CalculateSla(NoticeOfAward noa, IEnumerable<NoticeOfAwardMilestone>? milestones = null, DateTime? utcNow = null)
    {
        var now = utcNow ?? DateTime.UtcNow;
        var today = ToPhilippineDate(now);

        var milestoneList = (milestones ?? noa.Milestones ?? []).Where(m => !m.IsDeleted).ToList();
        var hasConforme = milestoneList.Any(m => m.MilestoneType == NoticeOfAwardMilestoneType.ConformeReceived);
        var hasSecurity = milestoneList.Any(m => m.MilestoneType == NoticeOfAwardMilestoneType.PerformanceSecurityPosted);
        var hasContract = milestoneList.Any(m => m.MilestoneType == NoticeOfAwardMilestoneType.ContractExecuted);

        var completedCount = (hasConforme ? 1 : 0) + (hasSecurity ? 1 : 0) + (hasContract ? 1 : 0);
        var progressPercent = (int)Math.Round((completedCount / 3.0) * 100);

        var pendingLabels = new List<string>();
        if (!hasConforme) pendingLabels.Add("Conforme Received");
        if (!hasSecurity) pendingLabels.Add("Performance Security");
        if (!hasContract) pendingLabels.Add("Contract Executed");

        var isIssued = noa.Status == NoticeOfAwardStatus.Approved && noa.IssuedAt.HasValue;

        if (!isIssued || !noa.IssuedAt.HasValue)
        {
            return new NoticeOfAwardSlaStateDto
            {
                IsIssued = false,
                IsComplete = false,
                IsOpen = false,
                IsOverdue = false,
                RequiresCascadeDecision = false,
                IssuedDate = null,
                ReceivedDate = null,
                DeadlineDate = null,
                DaysRemaining = null,
                ElapsedDays = null,
                ProgressPercent = 0,
                CompletedMilestones = 0,
                TotalMilestones = 3,
                PendingMilestoneLabels = ["Conforme Received", "Performance Security", "Contract Executed"],
                Label = noa.Status == NoticeOfAwardStatus.ForApproval ? "Pending Approval" : "Draft",
                Tone = "muted"
            };
        }

        var issuedDate = ToPhilippineDate(noa.IssuedAt.Value);
        var conformeMilestone = milestoneList.FirstOrDefault(m => m.MilestoneType == NoticeOfAwardMilestoneType.ConformeReceived);
        var receivedDate = noa.ReceivedAt ?? (conformeMilestone != null ? conformeMilestone.DateLogged : (DateOnly?)null);

        // Before receipt, NOA is issued but statutory 10-day countdown is not yet running
        if (!receivedDate.HasValue)
        {
            return new NoticeOfAwardSlaStateDto
            {
                IsIssued = true,
                IsComplete = false,
                IsOpen = false,
                IsOverdue = false,
                RequiresCascadeDecision = false,
                IssuedDate = issuedDate.ToString("yyyy-MM-dd"),
                ReceivedDate = null,
                DeadlineDate = null,
                DaysRemaining = null,
                ElapsedDays = Math.Max(0, today.DayNumber - issuedDate.DayNumber),
                ProgressPercent = (int)Math.Round((completedCount / 3.0) * 100),
                CompletedMilestones = completedCount,
                TotalMilestones = 3,
                PendingMilestoneLabels = pendingLabels,
                Label = "Issued — Awaiting Conforme",
                Tone = "info"
            };
        }

        var deadlineDate = noa.ContractExecutionDeadline ?? receivedDate.Value.AddDays(10);
        var isComplete = completedCount == 3 || hasContract;

        if (isComplete)
        {
            return new NoticeOfAwardSlaStateDto
            {
                IsIssued = true,
                IsComplete = true,
                IsOpen = false,
                IsOverdue = false,
                RequiresCascadeDecision = false,
                IssuedDate = issuedDate.ToString("yyyy-MM-dd"),
                ReceivedDate = receivedDate.Value.ToString("yyyy-MM-dd"),
                DeadlineDate = deadlineDate.ToString("yyyy-MM-dd"),
                DaysRemaining = Math.Max(0, deadlineDate.DayNumber - today.DayNumber),
                ElapsedDays = Math.Max(0, today.DayNumber - issuedDate.DayNumber),
                ProgressPercent = 100,
                CompletedMilestones = 3,
                TotalMilestones = 3,
                PendingMilestoneLabels = [],
                Label = "Complete",
                Tone = "success"
            };
        }

        var daysRemaining = deadlineDate.DayNumber - today.DayNumber;
        var elapsedDays = Math.Max(0, today.DayNumber - issuedDate.DayNumber);
        var isOverdue = today > deadlineDate;

        return new NoticeOfAwardSlaStateDto
        {
            IsIssued = true,
            IsComplete = false,
            IsOpen = true,
            IsOverdue = isOverdue,
            RequiresCascadeDecision = isOverdue,
            IssuedDate = issuedDate.ToString("yyyy-MM-dd"),
            ReceivedDate = receivedDate.Value.ToString("yyyy-MM-dd"),
            DeadlineDate = deadlineDate.ToString("yyyy-MM-dd"),
            DaysRemaining = Math.Max(0, daysRemaining),
            ElapsedDays = elapsedDays,
            ProgressPercent = progressPercent,
            CompletedMilestones = completedCount,
            TotalMilestones = 3,
            PendingMilestoneLabels = pendingLabels,
            Label = isOverdue ? $"{today.DayNumber - deadlineDate.DayNumber}d Overdue" : $"{Math.Max(0, daysRemaining)}d left",
            Tone = isOverdue ? "destructive" : (daysRemaining <= 3 ? "warning" : "muted")
        };
    }
}
