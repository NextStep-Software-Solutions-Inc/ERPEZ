namespace ERPEZ.Application.Features.Planning.Supplier.Dtos;

public record PatchSupplierRequestDto
{
    public string? Status { get; init; }
    public string? StatusNote { get; init; }
    public bool? IsBlocked { get; init; }
}
