using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Commands.CreateUACSCodeSegmentFiscalYear;

/// <summary>
/// Command to create a new UACS code segment fiscal year association.
/// </summary>
public class CreateUACSCodeSegmentFiscalYearCommand : IRequest<ApiResponse<Guid>>
{
    public Guid UACSCodeSegmentId { get; set; }
    public Guid FiscalYearId { get; set; }
    public DateTime EffectiveStartDate { get; set; }
    public DateTime? EffectiveEndDate { get; set; }
    public bool IsActive { get; set; }
}
