using System.Security.Cryptography;
using System.Text.RegularExpressions;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.RequestQuote;

public partial class RequestQuoteCommandHandler(ILogger<RequestQuoteCommandHandler> logger)
    : IRequestHandler<RequestQuoteCommand, ApiResponse<QuoteResponseDto>>
{
    public Task<ApiResponse<QuoteResponseDto>> Handle(RequestQuoteCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(command.ContactName))
        {
            return Task.FromResult(ApiResponse<QuoteResponseDto>.Fail("Contact name is required."));
        }

        if (string.IsNullOrWhiteSpace(command.OrganizationName))
        {
            return Task.FromResult(ApiResponse<QuoteResponseDto>.Fail("Organization name is required."));
        }

        if (string.IsNullOrWhiteSpace(command.Email) || !EmailRegex().IsMatch(command.Email.Trim()))
        {
            return Task.FromResult(ApiResponse<QuoteResponseDto>.Fail("A valid work email address is required."));
        }

        var planTier = string.IsNullOrWhiteSpace(command.Tier) ? "Starter" : command.Tier.Trim();
        var standardModules = PlanModuleCatalog.GetModulesForPlan(planTier);
        var requested = command.RequestedModules != null && command.RequestedModules.Count > 0
            ? command.RequestedModules.Distinct().ToList()
            : standardModules;

        var referenceCode = $"QT-{DateTime.UtcNow:yyyyMMdd}-{RandomNumberGenerator.GetHexString(6).ToUpperInvariant()}";
        var isAirGapped = command.DeploymentType.Equals("on-premise", StringComparison.OrdinalIgnoreCase);

        var deliveryTime = isAirGapped
            ? "1-3 business days for offline license certificate generation"
            : "Immediate workspace provisioning available upon confirmation";

        var scopeSummary = $"{command.PlanName} ({command.TeamSize} users) with {string.Join(", ", requested.Select(m => m.ToUpperInvariant()))} - {(isAirGapped ? "Air-Gapped Sovereign" : "Cloud SaaS")}";

        logger.LogInformation(
            "Quote requested: Reference={ReferenceCode}, Email={Email}, Organization={Org}, Plan={Plan}, Deployment={Deployment}",
            referenceCode, command.Email.Trim(), command.OrganizationName.Trim(), command.PlanName, command.DeploymentType);

        var responseDto = new QuoteResponseDto
        {
            ReferenceCode = referenceCode,
            PlanName = string.IsNullOrWhiteSpace(command.PlanName) ? planTier : command.PlanName,
            Tier = planTier,
            DeploymentType = isAirGapped ? "Air-Gapped On-Premise" : "Cloud SaaS (Datacenter)",
            EstimatedDelivery = deliveryTime,
            ScopeSummary = scopeSummary,
            IncludedModules = requested,
            SubmittedAtUtc = DateTime.UtcNow,
            Message = "Your customized scope quote has been generated. Our solutions team will reach out with commercial details."
        };

        return Task.FromResult(ApiResponse<QuoteResponseDto>.Success(responseDto, "Quote request submitted successfully."));
    }

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase)]
    private static partial Regex EmailRegex();
}
