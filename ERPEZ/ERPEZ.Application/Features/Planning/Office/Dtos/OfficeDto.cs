using Sieve.Attributes;

namespace ERPEZ.Application.Features.Planning.Office.Dtos;

public class OfficeDto
{
    public Guid Id { get; set; }
    public string OfficeHead { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Address { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string? ResponsibilityCenterCode { get; set; }
}
