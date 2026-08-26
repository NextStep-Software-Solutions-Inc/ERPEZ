using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Commands.DeleteUACSCodeCombinationFiscalYear;

/// <summary>
/// Command to delete a UACS code combination fiscal year association.
/// </summary>
public record DeleteUACSCodeCombinationFiscalYearCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
