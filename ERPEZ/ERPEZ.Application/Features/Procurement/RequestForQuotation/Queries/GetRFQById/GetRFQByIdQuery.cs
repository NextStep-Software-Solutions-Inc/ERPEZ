using ERPEZ.Shared.Common;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQById;

public record GetRFQByIdQuery(Guid Id) : IRequest<ApiResponse<RFQDetailDto>>;
