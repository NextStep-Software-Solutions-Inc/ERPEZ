using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Api.Configuration;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace ERPEZ.TenantManagement.Api.Controllers;

[Route("api/webhooks/clerk")]
[ApiController]
public class ClerkWebhookController(
    IUnitOfWork unitOfWork,
    IOptions<ClerkSettings> clerkSettings,
    ILogger<ClerkWebhookController> logger) : ControllerBase
{
    private readonly ClerkSettings settings = clerkSettings.Value;

    /// <summary>
    /// Ingests and processes Clerk identity lifecycle webhooks (e.g. user.created, user.updated, user.deleted).
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

        // Verify Svix webhook signature if secret is configured
        if (!string.IsNullOrWhiteSpace(settings.WebhookSecret) && !settings.WebhookSecret.Contains("placeholder"))
        {
            if (!VerifySvixSignature(payload, Request.Headers, settings.WebhookSecret))
            {
                logger.LogWarning("Invalid Clerk webhook signature received.");
                return Unauthorized(ApiResponse<object>.Fail("Invalid webhook signature."));
            }
        }

        try
        {
            using var jsonDoc = JsonDocument.Parse(payload);
            var root = jsonDoc.RootElement;
            var eventType = root.GetProperty("type").GetString();

            if (root.TryGetProperty("data", out var data))
            {
                var userId = data.GetProperty("id").GetString();
                if (string.IsNullOrWhiteSpace(userId))
                {
                    return Ok(ApiResponse<object>.Success("No user ID in webhook data."));
                }

                switch (eventType)
                {
                    case "user.created":
                    case "user.updated":
                        await SyncUserProfileAsync(userId, data, cancellationToken);
                        break;

                    case "user.deleted":
                        await HandleUserDeletedAsync(userId, cancellationToken);
                        break;

                    default:
                        logger.LogInformation("Unhandled Clerk webhook event type: {EventType}", eventType);
                        break;
                }
            }

            return Ok(ApiResponse<object>.Success("Webhook processed successfully."));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error processing Clerk webhook payload.");
            return StatusCode(500, ApiResponse<object>.Fail("Error processing webhook."));
        }
    }

    private async Task SyncUserProfileAsync(string clerkUserId, JsonElement data, CancellationToken ct)
    {
        var members = await unitOfWork.TenantMemberRepository.Query()
            .Where(m => m.ExternalIdentityId == clerkUserId && !m.IsDeleted)
            .ToListAsync(ct);

        if (members.Count == 0)
        {
            return;
        }

        var firstName = data.TryGetProperty("first_name", out var fn) ? fn.GetString() : null;
        var lastName = data.TryGetProperty("last_name", out var ln) ? ln.GetString() : null;

        string? email = null;
        if (data.TryGetProperty("email_addresses", out var emails) && emails.ValueKind == JsonValueKind.Array && emails.GetArrayLength() > 0)
        {
            var firstEmailObj = emails[0];
            if (firstEmailObj.TryGetProperty("email_address", out var emailProp))
            {
                email = emailProp.GetString();
            }
        }

        foreach (var member in members)
        {
            if (!string.IsNullOrWhiteSpace(firstName)) member.FirstName = firstName;
            if (!string.IsNullOrWhiteSpace(lastName)) member.LastName = lastName;
            if (!string.IsNullOrWhiteSpace(email)) member.Email = email.Trim().ToLowerInvariant();
            member.ConcurrencyStamp = Guid.NewGuid();
        }

        await unitOfWork.SaveChangesAsync(ct);
        logger.LogInformation("Synchronized profile for Clerk user {UserId} across {Count} tenant memberships.", clerkUserId, members.Count);
    }

    private async Task HandleUserDeletedAsync(string clerkUserId, CancellationToken ct)
    {
        var members = await unitOfWork.TenantMemberRepository.Query()
            .Where(m => m.ExternalIdentityId == clerkUserId && !m.IsDeleted)
            .ToListAsync(ct);

        foreach (var member in members)
        {
            member.Status = Status.Disabled;
            member.ConcurrencyStamp = Guid.NewGuid();
        }

        await unitOfWork.SaveChangesAsync(ct);
        logger.LogInformation("Deactivated {Count} tenant memberships for deleted Clerk user {UserId}.", members.Count, clerkUserId);
    }

    private static bool VerifySvixSignature(string payload, IHeaderDictionary headers, string secret)
    {
        if (!headers.TryGetValue("svix-id", out var svixId) ||
            !headers.TryGetValue("svix-timestamp", out var svixTimestamp) ||
            !headers.TryGetValue("svix-signature", out var svixSignature))
        {
            return false;
        }

        var secretBytes = secret.StartsWith("whsec_")
            ? Convert.FromBase64String(secret["whsec_".Length..])
            : Encoding.UTF8.GetBytes(secret);

        var signedPayload = $"{svixId}.{svixTimestamp}.{payload}";
        using var hmac = new HMACSHA256(secretBytes);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(signedPayload));
        var expectedSig = $"v1,{Convert.ToBase64String(hash)}";

        var signatures = svixSignature.ToString().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return signatures.Any(sig => CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(sig),
            Encoding.UTF8.GetBytes(expectedSig)));
    }
}
