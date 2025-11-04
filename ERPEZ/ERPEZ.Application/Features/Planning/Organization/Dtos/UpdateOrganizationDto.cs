namespace ERPEZ.Application.Features.Planning.Organization.Dtos;

public class UpdateOrganizationDto
{
    public Guid? ParentId { get; set; }
    public string? Name { get; set; } = string.Empty;
    public string? Code { get; set; } = string.Empty;
    public string? Type { get; set; } = string.Empty;
    public bool? IsActive { get; set; }
}
