using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Commands.DeleteOPCRActivityMOV;

public record DeleteOPCRActivityMOVCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
