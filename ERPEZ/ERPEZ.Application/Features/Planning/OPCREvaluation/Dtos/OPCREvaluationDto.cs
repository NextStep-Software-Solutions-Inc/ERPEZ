namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;

public class OPCREvaluationDto
{
    public Guid Id { get; set; }
    public Guid OPCRId { get; set; }
    public Guid EvaluatorId { get; set; }
    public DateTime EvaluationDate { get; set; }
    public string? Comments { get; set; }
    public string Status { get; set; } = string.Empty;
}
