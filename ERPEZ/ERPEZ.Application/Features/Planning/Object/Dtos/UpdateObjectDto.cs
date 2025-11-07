namespace ERPEZ.Application.Features.Planning.Object.Dtos;

public class UpdateObjectDto
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
