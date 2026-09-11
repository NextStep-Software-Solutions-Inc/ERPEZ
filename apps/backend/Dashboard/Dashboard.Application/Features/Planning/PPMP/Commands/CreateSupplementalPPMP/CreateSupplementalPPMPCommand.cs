using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.CreateSupplementalPPMP;

public record CreateSupplementalPPMPCommand(
    Guid SourcePPMPId,
    CreateSupplementalPPMPRequest? Dto = null
) : IRequest<ApiResponse<Guid>>;
