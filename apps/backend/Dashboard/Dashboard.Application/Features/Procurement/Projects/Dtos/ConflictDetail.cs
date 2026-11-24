using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.Projects.Dtos;

public record ConflictDetail
{
    public DateOnly Date { get; init; }
    /// <summary>"venue" or "quorum"</summary>
    public string ConflictType { get; init; } = string.Empty;
    public string Venue { get; init; } = string.Empty;
    public List<Guid> EventIds { get; init; } = [];
}
