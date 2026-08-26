using ERPEZ.Application.Features.Planning.ItemRequest.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemRequest.Queries.GetItemRequestById;

public record GetItemRequestByIdQuery(Guid Id) : IRequest<ApiResponse<ItemRequestResponse>>;
