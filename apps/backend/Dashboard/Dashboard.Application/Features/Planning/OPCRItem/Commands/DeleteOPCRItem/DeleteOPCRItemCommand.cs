using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Commands.DeleteOPCRItem;

public record DeleteOPCRItemCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
