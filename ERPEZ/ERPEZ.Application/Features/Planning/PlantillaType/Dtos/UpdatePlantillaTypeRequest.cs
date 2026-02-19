namespace ERPEZ.Application.Features.Planning.PlantillaType.Dtos;

public record UpdatePlantillaTypeRequest
{
    public string? Name { get; init; }
    public string? Code { get; init; }
    public int? Duration { get; init; }
    public bool? RequiresActingAppointments { get; init; }
    public bool? AllowsContractual { get; init; }
    public bool? IsActive { get; init; }
    public string? Benefits { get; init; }
}
