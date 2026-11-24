using ERPEZ.Shared.Common;
using MediatR;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.UNSPSCCode.Commands.UpdateUNSPSCCode;

public record UpdateUNSPSCCodeCommand : IRequest<ApiResponse<Unit>>
{
    [JsonIgnore]
    public Guid Id { get; init; }
    public string? Code { get; init; }
    public string? Name { get; init; }
    public int? Level { get; init; }
    public Guid? ParentId { get; init; }
}
