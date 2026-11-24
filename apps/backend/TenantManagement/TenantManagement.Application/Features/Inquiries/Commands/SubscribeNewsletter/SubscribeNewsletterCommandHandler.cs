using System.Text.RegularExpressions;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.SubscribeNewsletter;

public partial class SubscribeNewsletterCommandHandler(
    ILogger<SubscribeNewsletterCommandHandler> logger,
    ERPEZ.TenantManagement.Application.Features.Inquiries.Common.IInquiryStore? inquiryStore = null)
    : IRequestHandler<SubscribeNewsletterCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(SubscribeNewsletterCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(command.Email) || !EmailRegex().IsMatch(command.Email.Trim()))
        {
            return ApiResponse<bool>.Fail("A valid email address is required.");
        }

        var normalizedEmail = command.Email.Trim().ToLowerInvariant();
        logger.LogInformation("Newsletter subscription registered: Email={Email}", normalizedEmail);

        if (inquiryStore != null)
        {
            try
            {
                await inquiryStore.AddSubscriberAsync(new ERPEZ.TenantManagement.Application.Features.Inquiries.Common.SubscriberInquiryDto
                {
                    Email = normalizedEmail,
                    Source = "Landing Page Footer",
                    Status = "Active",
                    SubscribedAtUtc = DateTime.UtcNow
                }, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to persist newsletter subscription for Email={Email}", normalizedEmail);
                return ApiResponse<bool>.Fail("We are temporarily unable to register your subscription. Please try again shortly.");
            }
        }

        return ApiResponse<bool>.Success(true, "Thank you for subscribing to ERP-EZ product and release updates.");
    }

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase)]
    private static partial Regex EmailRegex();
}
