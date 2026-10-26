using ERPEZ.Application.Features.Planning.WFP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Queries.GetWFPById;

public record GetWFPByIdQuery(Guid Id) : IRequest<ApiResponse<WFPResponse>>;
