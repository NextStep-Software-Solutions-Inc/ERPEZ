using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Commands.CreateMFOPAP;

public class CreateMFOPAPCommand : IRequest<ApiResponse<Domain.Entities.Planning.MFOPAP>>
{
}
