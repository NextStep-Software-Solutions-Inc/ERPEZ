using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.UpdatePPMP;

public record UpdatePPMPCommand(Guid Id, UpdatePPMPRequest Dto) : IRequest<ApiResponse<Unit>>;
