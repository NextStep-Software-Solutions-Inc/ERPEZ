using Microsoft.AspNetCore.Http;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;

public class CreateKPIMOVRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? FileId { get; set; }
}
