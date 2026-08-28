using System;

namespace ERPEZ.Application.Features.Procurement.Projects.Dtos;

public record APPItemLinkResponse
{
    public Guid Id { get; init; }
    public Guid APPItemId { get; init; }
    public string ItemNumber { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string OfficeName { get; init; } = string.Empty;
    public decimal EffectiveABC { get; init; }
    public int Order { get; init; }
    public string AppNumber { get; init; } = string.Empty;
    public string AppName { get; init; } = string.Empty;
}
