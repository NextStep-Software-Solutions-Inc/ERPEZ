namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;

public record OPCREvaluationResponse
{
    public Guid Id { get; init; }
    public Guid OPCRId { get; init; }
    public Guid EvaluatorId { get; init; }
    public DateTime EvaluationDate { get; init; }
    public string? Comments { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
