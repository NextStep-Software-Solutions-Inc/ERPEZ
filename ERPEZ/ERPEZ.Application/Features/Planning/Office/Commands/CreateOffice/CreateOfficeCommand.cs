using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Commands.CreateOffice;

public class CreateOfficeCommand : IRequest<ApiResponse<Guid>>
{
    public Guid? ClusterId { get; set; }
    public string OfficeHead { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Address { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string? ResponsibilityCenterCode { get; set; }
    public bool? IsDeliveryUnit { get; set; }
}
