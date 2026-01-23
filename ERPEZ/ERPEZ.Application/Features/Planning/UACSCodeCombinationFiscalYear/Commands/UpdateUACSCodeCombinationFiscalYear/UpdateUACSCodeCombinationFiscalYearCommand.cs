using ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Commands.UpdateUACSCodeCombinationFiscalYear;

/// <summary>
/// Command to update an existing UACS code combination fiscal year association.
/// </summary>
public class UpdateUACSCodeCombinationFiscalYearCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateUACSCodeCombinationFiscalYearRequest UpdateUACSCodeCombinationFiscalYear { get; set; }
}
