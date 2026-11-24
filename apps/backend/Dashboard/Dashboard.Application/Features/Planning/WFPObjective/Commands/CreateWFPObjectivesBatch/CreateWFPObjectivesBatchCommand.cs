using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.CreateWFPObjectivesBatch;

/// <summary>
/// Command for creating multiple WFP Objectives in a single request.
/// </summary>
public class CreateWFPObjectivesBatchCommand : IRequest<ApiResponse<Unit>>
{
    public Guid WFPId { get; set; }
    public List<CreateWFPObjectiveItemRequest> WFPObjectives { get; set; } = [];
}
