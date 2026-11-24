using ERPEZ.Application.Features.Planning.PPMPItem.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Queries.GetAvailablePPMPItems;

public record GetAvailablePPMPItemsQuery(Guid APPId) : IRequest<ApiResponse<List<PPMPItemResponse>>>;
