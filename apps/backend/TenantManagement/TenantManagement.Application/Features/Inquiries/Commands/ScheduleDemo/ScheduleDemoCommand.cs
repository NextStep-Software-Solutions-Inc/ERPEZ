using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.ScheduleDemo;

public record ScheduleDemoCommand : IRequest<ApiResponse<DemoResponseDto>>
{
    public string ContactName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string OrganizationName { get; init; } = string.Empty;
    public string? PhoneNumber { get; init; }
    public string PreferredDate { get; init; } = string.Empty;
    public string PreferredTimeSlot { get; init; } = string.Empty;
    public IReadOnlyList<string> TopicsOfInterest { get; init; } = [];
    public string? Notes { get; init; }
}

public record DemoResponseDto
{
    public string ReferenceCode { get; init; } = string.Empty;
    public string ContactName { get; init; } = string.Empty;
    public string OrganizationName { get; init; } = string.Empty;
    public string PreferredDate { get; init; } = string.Empty;
    public string PreferredTimeSlot { get; init; } = string.Empty;
    public DateTime SubmittedAtUtc { get; init; }
    public string Message { get; init; } = string.Empty;
}
