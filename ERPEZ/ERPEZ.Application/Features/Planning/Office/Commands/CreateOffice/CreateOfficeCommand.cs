using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Commands.CreateOffice;

public record CreateOfficeCommand : IRequest<ApiResponse<Guid>>
{
    public Guid? ClusterId { get; set; }
    public required string OfficeHead { get; set; } = string.Empty;
    public required string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public required string Address { get; set; } = string.Empty;
    public required string Email { get; set; } = string.Empty;
    public required string ContactNumber { get; set; } = string.Empty;
    public string? ResponsibilityCenterCode { get; set; }
    public bool? IsDeliveryUnit { get; set; }
}
