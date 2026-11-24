using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Commands.DeleteUACSCodeSegmentFiscalYear;

/// <summary>
/// Command to delete a UACS code segment fiscal year association.
/// </summary>
public record DeleteUACSCodeSegmentFiscalYearCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
