namespace ERPEZ.Application.Features.Planning.Office.Dtos;

public class UpdateOfficeRequest
{
    public string? OfficeHead { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? ContactNumber { get; set; }
    public string? ResponsibilityCenterCode { get; set; }
}
