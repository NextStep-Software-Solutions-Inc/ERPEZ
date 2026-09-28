using System.Text;
using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Api.Configuration;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ERPEZ.TenantManagement.Api.Controllers;

[Route("api/webhooks/clerk")]
[Route("webhooks/clerk")]
[ApiController]
public class ClerkWebhookController(
    IWebhookInboxService inboxService,
    IOptions<ClerkSettings> clerkSettings,
    IConfiguration configuration,
    IServiceProvider serviceProvider,
    ILogger<ClerkWebhookController> logger) : ControllerBase
{
    private readonly ClerkSettings settings = clerkSettings.Value;

    /// <summary>
    /// Ingests and processes Clerk organization and membership lifecycle webhooks into the durable inbox.
    /// </summary>
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> HandleWebhook(CancellationToken cancellationToken)
    {
        string payload;
        using (var reader = new StreamReader(Request.Body, Encoding.UTF8))
        {
            payload = await reader.ReadToEndAsync(cancellationToken);
        }

        var secret = settings.WebhookSecret ?? configuration["Clerk:WebhookSecret"];
        var svixId = Request.Headers["svix-id"].FirstOrDefault();
        var svixTimestamp = Request.Headers["svix-timestamp"].FirstOrDefault();
        var svixSignature = Request.Headers["svix-signature"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(svixId))
        {
            return BadRequest(ApiResponse<object>.Fail("Missing required 'svix-id' header."));
        }

        // Verify Svix cryptographic signature if configured
        if (!string.IsNullOrWhiteSpace(secret) && !secret.Contains("placeholder"))
        {
            if (!SvixWebhookVerifier.VerifySignature(payload, svixId, svixTimestamp ?? string.Empty, svixSignature ?? string.Empty, secret))
            {
                logger.LogWarning("Invalid Clerk webhook signature received for svix-id {SvixId}.", svixId);
                return BadRequest(ApiResponse<object>.Fail("Invalid webhook signature."));
            }
        }

        // Transactionally ingest into durable WebhookInbox
        var status = await inboxService.IngestAsync(svixId, payload, cancellationToken);
        if (status == WebhookIngestionStatus.Duplicate)
        {
            return Ok(ApiResponse<object>.Success("Webhook already processed."));
        }

        // Best-effort immediate background execution
        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = serviceProvider.CreateScope();
                var scopedInbox = scope.ServiceProvider.GetRequiredService<IWebhookInboxService>();
                await scopedInbox.ProcessPendingBatchAsync(10, CancellationToken.None);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Background processing of webhook batch failed");
            }
        });

        return Accepted(ApiResponse<object>.Success("Webhook accepted for processing."));
    }
}
