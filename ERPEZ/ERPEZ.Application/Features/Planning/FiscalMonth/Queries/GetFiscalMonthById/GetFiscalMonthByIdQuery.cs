using ERPEZ.Application.Features.Planning.FiscalMonth.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalMonth.Queries.GetFiscalMonthById;

public record GetFiscalMonthByIdQuery(Guid Id) : IRequest<ApiResponse<FiscalMonthDetailedResponse>>;
