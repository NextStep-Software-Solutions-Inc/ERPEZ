namespace ERPEZ.Application.Features.Planning.Step.Dtos;

public record UpdateStepRequest
{
    public string? Name { get; init; }
    public string? Code { get; init; }
    public int? StepNumber { get; init; }
    public int? MinStep { get; init; }
    public int? MaxStep { get; init; }
    public string? Description { get; init; }
    public bool? IsActive { get; init; }
}
