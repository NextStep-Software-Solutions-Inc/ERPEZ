using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalMonth.Commands.UnlockFiscalMonth;

public record UnlockFiscalMonthCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
