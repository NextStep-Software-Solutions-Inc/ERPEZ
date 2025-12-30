using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Commands.UpdateMFOPAP;

public class UpdateMFOPAPCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateMFOPAPRequest UpdateMFOPAP { get; set; }
}
