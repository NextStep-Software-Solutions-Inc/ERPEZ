namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;

public record UpdateOPCREvaluationRequest
{
    public DateTime? EvaluationDate { get; init; }
    public string? Comments { get; init; }
    public string? Status { get; init; }
}
