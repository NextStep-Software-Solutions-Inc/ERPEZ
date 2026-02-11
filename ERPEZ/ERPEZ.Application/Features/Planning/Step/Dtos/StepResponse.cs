namespace ERPEZ.Application.Features.Planning.Step.Dtos;

public record StepResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Code { get; init; }
    public required int StepNumber { get; init; }
    public required int MinStep { get; init; }
    public required int MaxStep { get; init; }
    public string? Description { get; init; }
    public required bool IsActive { get; init; }
    public required DateTime CreatedAt { get; init; }
}
