using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalMonth.Commands.LockFiscalMonth;

public record LockFiscalMonthCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
