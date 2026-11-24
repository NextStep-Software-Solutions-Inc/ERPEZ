using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Commands.CreateUACSCodeCombinationFiscalYear;

/// <summary>
/// Command to create a new UACS code combination fiscal year association.
/// </summary>
public class CreateUACSCodeCombinationFiscalYearCommand : IRequest<ApiResponse<Guid>>
{
    public Guid UACSCodeCombinationId { get; set; }
    public Guid FiscalYearId { get; set; }
    public DateTime IsValidFrom { get; set; }
    public DateTime? IsValidTo { get; set; }
    public bool IsActive { get; set; }
}
