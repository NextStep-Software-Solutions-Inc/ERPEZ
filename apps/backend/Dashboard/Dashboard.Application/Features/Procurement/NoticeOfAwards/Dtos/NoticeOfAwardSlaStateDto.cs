namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;

public record NoticeOfAwardSlaStateDto
{
    public bool IsIssued { get; init; }
    public bool IsComplete { get; init; }
    public bool IsOpen { get; init; }
    public bool IsOverdue { get; init; }
    public bool RequiresCascadeDecision { get; init; }
    public string? IssuedDate { get; init; }
    public string? ReceivedDate { get; init; }
    public string? DeadlineDate { get; init; }
    public int? DaysRemaining { get; init; }
    public int? ElapsedDays { get; init; }
    public int ProgressPercent { get; init; }
    public int CompletedMilestones { get; init; }
    public int TotalMilestones { get; init; } = 3;
    public List<string> PendingMilestoneLabels { get; init; } = [];
    public string Label { get; init; } = string.Empty;
    public string Tone { get; init; } = "muted";
}
