using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.BiddingSchedules.Dtos;

public class MilestoneEditEntryResponse
{
    public string OriginalDate { get; set; } = string.Empty;
    public string NewDate { get; set; } = string.Empty;
    public string EditedBy { get; set; } = string.Empty;
    public string Timestamp { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}

public class BiddingMilestoneResponse
{
    public string Id { get; set; } = string.Empty;
    public int Order { get; set; }
    public string MilestoneKey { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string ComputedDate { get; set; } = string.Empty; // YYYY-MM-DD
    public string? OverrideDate { get; set; }
    public string? Time { get; set; }
    public string Status { get; set; } = "auto-generated"; // auto-generated | edited
    public bool IsEdited { get; set; }
    public string? CompletedAt { get; set; }
    public string? CompletedBy { get; set; }
    public List<MilestoneEditEntryResponse> EditHistory { get; set; } = [];
}

public class BiddingScheduleResponse
{
    public string Id { get; set; } = string.Empty;
    public string BacResolutionId { get; set; } = string.Empty;
    public string BacResolutionNumber { get; set; } = string.Empty;
    public string ProcurementCategory { get; set; } = "goods";
    public string IbPostingDate { get; set; } = string.Empty; // YYYY-MM-DD
    public string Status { get; set; } = "draft"; // draft | confirmed | locked
    public List<BiddingMilestoneResponse> Milestones { get; set; } = [];
    public string CreatedBy { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    public string? ConfirmedAt { get; set; }
    public string? ConfirmedBy { get; set; }
    public string? LockedAt { get; set; }
    public string? LockedBy { get; set; }
}
