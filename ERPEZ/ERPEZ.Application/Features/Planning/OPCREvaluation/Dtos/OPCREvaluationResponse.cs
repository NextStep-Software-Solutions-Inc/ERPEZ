namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;

public class OPCREvaluationResponse
{
    public Guid Id { get; set; }
    public Guid OPCRId { get; set; }
    public Guid EvaluatorId { get; set; }
    public DateTime EvaluationDate { get; set; }
    public string? Comments { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}
