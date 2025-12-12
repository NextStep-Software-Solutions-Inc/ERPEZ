using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.CreateOPCRActivity;

public class CreateOPCRActivityCommand : IRequest<ApiResponse<OPCRActivityResponse>>
{
    public Guid OPCRId { get; set; }
    public Guid DUKPIAssignmentId { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public decimal Budget { get; set; }
}
