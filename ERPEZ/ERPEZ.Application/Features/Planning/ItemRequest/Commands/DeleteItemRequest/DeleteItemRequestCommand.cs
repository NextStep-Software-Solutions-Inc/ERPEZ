using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemRequest.Commands.DeleteItemRequest;

public record DeleteItemRequestCommand(Guid Id) : IRequest<ApiResponse<Guid>>;
