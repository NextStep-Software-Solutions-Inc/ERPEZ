namespace ERPEZ.Application.Features.Planning.Office.Dtos;

public record UpdateOfficeRequest
{
    public string? OfficeHead { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public string? Address { get; init; }
    public string? Email { get; init; }
    public string? ContactNumber { get; init; }
    public string? ResponsibilityCenterCode { get; init; }
    public bool? IsDeliveryUnit { get; init; }
}
