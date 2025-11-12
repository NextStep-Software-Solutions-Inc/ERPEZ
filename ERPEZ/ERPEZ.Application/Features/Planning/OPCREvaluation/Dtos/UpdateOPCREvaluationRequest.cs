namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;

public class UpdateOPCREvaluationRequest
{
    public DateTime? EvaluationDate { get; set; }
    public string? Comments { get; set; }
    public string? Status { get; set; }
}
