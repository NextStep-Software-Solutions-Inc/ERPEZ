namespace ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProjectStatus;

public record UpdateProcurementProjectStatusRequest
{
    public required string Status { get; init; }
}
