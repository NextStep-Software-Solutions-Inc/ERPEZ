using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Queries.GetAPRById;

public record GetAPRByIdQuery(Guid Id) : IRequest<ApiResponse<APRDetailDto>>;
