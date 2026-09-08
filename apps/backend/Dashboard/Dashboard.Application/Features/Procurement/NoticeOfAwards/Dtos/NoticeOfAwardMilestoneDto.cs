using System;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;

public record NoticeOfAwardMilestoneDto
{
    public Guid Id { get; init; }
    public Guid NoticeOfAwardId { get; init; }
    public NoticeOfAwardMilestoneType MilestoneType { get; init; }
    public string MilestoneKey { get; init; } = string.Empty;
    public DateOnly DateLogged { get; init; }
    public Guid? FileId { get; init; }
    public string? FileName { get; init; }
    public string? Remarks { get; init; }
    public string? LoggedByName { get; init; }
}
