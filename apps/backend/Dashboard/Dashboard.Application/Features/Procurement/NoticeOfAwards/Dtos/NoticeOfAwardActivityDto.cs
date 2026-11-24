using System;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;

public record NoticeOfAwardActivityDto
{
    public Guid Id { get; init; }
    public string Action { get; init; } = string.Empty;
    public string Actor { get; init; } = string.Empty;
    public DateTime Timestamp { get; init; }
    public string? Note { get; init; }
}
