namespace ERPEZ.Application.Features.Planning.Location.Dtos;

public class LocationResponse
{
    public Guid? ParentId { get; set; }
    public string? Name { get; set; }
    public string? Code { get; set; }
    public string? Type { get; set; }
    public bool? IsActive { get; set; }
}
