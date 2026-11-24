using ERPEZ.Application.Features.Planning.OPCRItem.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Queries.GetOPCRItemById;

public record GetOPCRItemByIdQuery(Guid Id) : IRequest<ApiResponse<OPCRItemResponse>>;
