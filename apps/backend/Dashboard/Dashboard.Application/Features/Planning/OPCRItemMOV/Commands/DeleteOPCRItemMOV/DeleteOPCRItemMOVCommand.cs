using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.DeleteOPCRItemMOV;

public record DeleteOPCRItemMOVCommand(Guid Id) : IRequest<ApiResponse<Unit>>;