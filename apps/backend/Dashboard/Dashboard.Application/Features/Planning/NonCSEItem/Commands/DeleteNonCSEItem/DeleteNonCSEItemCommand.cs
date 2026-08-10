using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Commands.DeleteNonCSEItem;

public record DeleteNonCSEItemCommand(Guid Id) : IRequest<ApiResponse<Guid>>;
