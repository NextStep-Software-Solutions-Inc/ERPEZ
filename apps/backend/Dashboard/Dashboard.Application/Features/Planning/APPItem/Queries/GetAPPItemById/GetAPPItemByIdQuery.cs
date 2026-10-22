using ERPEZ.Application.Features.Planning.APPItem.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItem.Queries.GetAPPItemById;

public record GetAPPItemByIdQuery(Guid Id) : IRequest<ApiResponse<APPItemResponse>>;
