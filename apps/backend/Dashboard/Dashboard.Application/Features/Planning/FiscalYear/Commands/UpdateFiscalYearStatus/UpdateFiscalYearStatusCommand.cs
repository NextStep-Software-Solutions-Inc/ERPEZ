using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYearStatus;

public record UpdateFiscalYearStatusCommand(Guid Id, string Status) : IRequest<ApiResponse<Unit>>;
