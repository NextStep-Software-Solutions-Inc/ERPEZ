using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Commands.UpdateMFOPAP;

public class UpdateMFOPAPCommand : IRequest<ApiResponse<Domain.Entities.Planning.MFOPAP>>
{
    public Guid Id { get; set; }
    public required UpdateMFOPAPDto UpdateMFOPAP { get; set; }
}
