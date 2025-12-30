using Microsoft.AspNetCore.Http;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;

public record CreateKPIMOVRequest
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid? FileId { get; init; }
}
