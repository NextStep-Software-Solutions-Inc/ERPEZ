namespace ERPEZ.Application.Features.Planning.MFOPAP.Dtos;

public class UpdateMFOPAPDto
{
    public Guid? ParentId { get; set; }
    public string? Name { get; set; }
    public string? Code { get; set; }
    public string? Type { get; set; }
    public bool? IsActive { get; set; }
}
