using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItem.Commands.DeleteAPPItem;

public record DeleteAPPItemCommand(Guid Id) : IRequest<ApiResponse<bool>>;
