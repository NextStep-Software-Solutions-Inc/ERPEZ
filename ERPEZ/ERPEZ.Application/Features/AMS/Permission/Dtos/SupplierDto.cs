namespace ERPEZ.Application.Features.AMS.Permission.Dtos;

public class SupplierDto
{
    public Guid Id { get; set; }
    public int Module { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
