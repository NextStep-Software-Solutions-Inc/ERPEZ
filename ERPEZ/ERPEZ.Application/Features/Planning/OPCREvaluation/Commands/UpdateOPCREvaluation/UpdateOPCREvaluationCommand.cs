using ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Commands.UpdateOPCREvaluation;

public class UpdateOPCREvaluationCommand : IRequest<ApiResponse<OPCREvaluationDto>>
{
    public Guid Id { get; set; }
    public required UpdateOPCREvaluationDto UpdateOPCREvaluation { get; set; }
}

