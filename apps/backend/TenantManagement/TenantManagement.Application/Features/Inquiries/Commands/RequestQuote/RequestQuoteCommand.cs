using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.RequestQuote;

public record RequestQuoteCommand : IRequest<ApiResponse<QuoteResponseDto>>
{
    public string PlanName { get; init; } = string.Empty;
    public string Tier { get; init; } = string.Empty;
    public string DeploymentType { get; init; } = "saas";
    public string ContactName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? PhoneNumber { get; init; }
    public string OrganizationName { get; init; } = string.Empty;
    public string TeamSize { get; init; } = "1-15";
    public IReadOnlyList<string> RequestedModules { get; init; } = [];
    public string? Notes { get; init; }
}

public record QuoteResponseDto
{
    public string ReferenceCode { get; init; } = string.Empty;
    public string PlanName { get; init; } = string.Empty;
    public string Tier { get; init; } = string.Empty;
    public string DeploymentType { get; init; } = string.Empty;
    public string EstimatedDelivery { get; init; } = string.Empty;
    public string ScopeSummary { get; init; } = string.Empty;
    public IReadOnlyList<string> IncludedModules { get; init; } = [];
    public DateTime SubmittedAtUtc { get; init; }
    public string Message { get; init; } = string.Empty;
}
