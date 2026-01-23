using ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Commands.UpdateUACSCodeSegmentFiscalYear;

/// <summary>
/// Command to update an existing UACS code segment fiscal year association.
/// </summary>
public class UpdateUACSCodeSegmentFiscalYearCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateUACSCodeSegmentFiscalYearRequest UpdateUACSCodeSegmentFiscalYear { get; set; }
}
