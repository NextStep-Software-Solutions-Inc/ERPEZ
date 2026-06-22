using System;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProject;

public record UpdateProcurementProjectRequest
{
    public required string Title { get; init; }
    public required Guid ModeOfProcurementId { get; init; }
    public required decimal ABC { get; init; }
    public required string Status { get; init; }
}
