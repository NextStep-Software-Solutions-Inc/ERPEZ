using System;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Dtos;

public record ProcurementAuditLogItemDto
{
    public Guid Id { get; init; }
    public string ActorName { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public string Action { get; init; } = string.Empty;
    public string EntityName { get; init; } = string.Empty;
    public string DocumentNumber { get; init; } = string.Empty;
    public DateTime Timestamp { get; init; }
    public string? Notes { get; init; }
}
