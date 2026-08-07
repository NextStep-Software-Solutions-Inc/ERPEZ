using ERPEZ.Application.Features.Planning.NonCSEItem.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Queries.GetNonCSEItemById;

public record GetNonCSEItemByIdQuery(Guid Id) : IRequest<ApiResponse<NonCSEItemResponse>>;
