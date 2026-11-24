using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Commands.DeleteOPCRConsolidation;

public record DeleteOPCRConsolidationCommand(Guid Id) : IRequest<ApiResponse<Unit>>;