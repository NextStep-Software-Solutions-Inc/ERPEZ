using ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Queries.GetPPMPExpenditureItemById;

public record GetPPMPExpenditureItemByIdQuery(Guid Id) : IRequest<ApiResponse<PPMPExpenditureItemResponse>>;
