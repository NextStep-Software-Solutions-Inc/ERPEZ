using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Commands.CreateOPCREvaluation;

public class CreateOPCREvaluationCommand : IRequest<ApiResponse<Guid>>
{
    public Guid OPCRId { get; set; }
    public Guid EvaluatorId { get; set; }
    public DateTime EvaluationDate { get; set; }
    public string? Comments { get; set; }
    public string Status { get; set; } = string.Empty;
}
