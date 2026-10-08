using System.Text.RegularExpressions;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.SubscribeNewsletter;

public partial class SubscribeNewsletterCommandHandler(ILogger<SubscribeNewsletterCommandHandler> logger)
    : IRequestHandler<SubscribeNewsletterCommand, ApiResponse<bool>>
{
    public Task<ApiResponse<bool>> Handle(SubscribeNewsletterCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(command.Email) || !EmailRegex().IsMatch(command.Email.Trim()))
        {
            return Task.FromResult(ApiResponse<bool>.Fail("A valid email address is required."));
        }

        var normalizedEmail = command.Email.Trim().ToLowerInvariant();
        logger.LogInformation("Newsletter subscription registered: Email={Email}", normalizedEmail);

        return Task.FromResult(ApiResponse<bool>.Success(true, "Thank you for subscribing to ERP-EZ product and release updates."));
    }

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase)]
    private static partial Regex EmailRegex();
}
