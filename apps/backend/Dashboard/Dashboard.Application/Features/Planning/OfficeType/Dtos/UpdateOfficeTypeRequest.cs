namespace ERPEZ.Application.Features.Planning.OfficeType.Dtos;

public record UpdateOfficeTypeRequest
{
    public string? Name { get; init; }
    public string? Code { get; init; }
    public bool? CanHaveChildren { get; init; }
    public bool? IsActive { get; init; }
}
