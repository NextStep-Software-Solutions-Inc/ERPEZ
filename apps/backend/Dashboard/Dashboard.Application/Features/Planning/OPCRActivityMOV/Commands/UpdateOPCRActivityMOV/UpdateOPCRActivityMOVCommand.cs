using ERPEZ.Application.Features.Planning.OPCRActivityMOV.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Commands.UpdateOPCRActivityMOV;

public class UpdateOPCRActivityMOVCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateOPCRActivityMOVRequest UpdateMOV { get; set; }
}
