namespace ERPEZ.Application.Features.Planning.MFOPAP.Dtos;

public class MFOPAPDto
{
    public Guid? ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
