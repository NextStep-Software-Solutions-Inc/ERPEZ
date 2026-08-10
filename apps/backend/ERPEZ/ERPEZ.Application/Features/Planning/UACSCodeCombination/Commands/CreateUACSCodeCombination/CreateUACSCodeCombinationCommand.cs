using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombination.Commands.CreateUACSCodeCombination;

public class CreateUACSCodeCombinationCommand : IRequest<ApiResponse<Guid>>
{
    public Guid? FundSourceId { get; set; }
    public Guid? OrganizationId { get; set; }
    public Guid? LocationId { get; set; }
    public Guid? MFOPAPId { get; set; }
    public Guid? ObjectId { get; set; }
    public string CombinationCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsValid { get; set; }
    public Guid? FiscalYearId { get; set; }
    public DateTime EffectiveDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsActive { get; set; }
}
