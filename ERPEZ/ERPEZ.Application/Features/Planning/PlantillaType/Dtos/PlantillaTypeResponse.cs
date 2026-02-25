namespace ERPEZ.Application.Features.Planning.PlantillaType.Dtos;

public record PlantillaTypeResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Code { get; init; }
    public int? Duration { get; init; }
    public required bool RequiresActingAppointments { get; init; }
    public required bool AllowsContractual { get; init; }
    public required bool IsActive { get; init; }
    public string? Benefits { get; init; }
    public DateTime CreatedAt { get; init; }
}
