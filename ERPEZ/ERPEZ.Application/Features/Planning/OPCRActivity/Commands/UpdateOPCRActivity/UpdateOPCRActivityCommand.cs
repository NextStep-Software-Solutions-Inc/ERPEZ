using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.UpdateOPCRActivity;

public class UpdateOPCRActivityCommand : IRequest<ApiResponse<Domain.Entities.Planning.OPCRActivity>>
{
    public Guid Id { get; set; }
    public required UpdateOPCRActivityRequest UpdateOPCRActivity { get; set; }
}
