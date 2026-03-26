using ERPEZ.Shared.Common;
using MediatR;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.SetLockStatus;

public record SetFYActiveKPILockStatusCommand : IRequest<ApiResponse<int>>
{
    [JsonIgnore]
    public Guid FiscalYearId { get; init; }
    public bool? IsLocked { get; init; }
}
