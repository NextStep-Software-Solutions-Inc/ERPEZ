using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.UpdateOPCRItemMOV;

public class UpdateOPCRItemMOVCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public UpdateOPCRItemMOVRequest UpdateOPCRItemMOV { get; set; } = null!;
}