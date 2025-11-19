namespace ERPEZ.Application.Features.Planning.Location.Dtos;

public class UpdateLocationDto
{
    public Guid Id { get; set; }
    public Guid? ParentId { get; set; }
    public string? Name { get; set; }
    public string? Code { get; set; }
    public string? Type { get; set; }
    public bool? IsActive { get; set; }
}
