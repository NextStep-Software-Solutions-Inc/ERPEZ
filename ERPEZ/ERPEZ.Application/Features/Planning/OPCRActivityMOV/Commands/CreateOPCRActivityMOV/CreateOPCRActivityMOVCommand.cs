using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Commands.CreateOPCRActivityMOV;

public class CreateOPCRActivityMOVCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid OPCRActivityId { get; set; }
    public required Guid FileId { get; set; }
}
