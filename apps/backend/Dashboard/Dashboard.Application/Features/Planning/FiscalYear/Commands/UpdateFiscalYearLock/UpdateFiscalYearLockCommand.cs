using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYearLock;

public record UpdateFiscalYearLockCommand(Guid Id, bool IsLocked) : IRequest<ApiResponse<Unit>>;
