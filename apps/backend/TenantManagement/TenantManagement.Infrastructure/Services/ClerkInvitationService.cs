using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ERPEZ.TenantManagement.Infrastructure.Services;

public class ClerkInvitationService(
    HttpClient httpClient,
    IConfiguration configuration,
    ILogger<ClerkInvitationService> logger) : IClerkInvitationService
{
    private static readonly JsonSerializerOptions jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public async Task<ClerkInvitationResult?> CreateInvitationAsync(
        string emailAddress,
        Dictionary<string, object> publicMetadata,
        string? redirectUrl = null,
        bool notify = true,
        bool ignoreExisting = true,
        CancellationToken ct = default)
    {
        var secretKey = configuration["Clerk:SecretKey"];
        var baseUrl = configuration["Clerk:ApiBaseUrl"]?.TrimEnd('/') ?? "https://api.clerk.com/v1";

        // Fallback for development/testing if Clerk secret key is not set
        if (string.IsNullOrWhiteSpace(secretKey) || secretKey.Contains("placeholder") || secretKey.Contains("example.com"))
        {
            logger.LogInformation("Clerk:SecretKey not set or placeholder. Emulating user invitation for {Email}", emailAddress);
            var mockId = $"inv_mock_{Guid.NewGuid():N}";
            return new ClerkInvitationResult(
                Id: mockId,
                EmailAddress: emailAddress,
                Status: "pending",
                Url: null,
                CreatedAt: DateTime.UtcNow
            );
        }

        try
        {
            var requestUri = $"{baseUrl}/invitations";
            var requestBody = new Dictionary<string, object>
            {
                ["email_address"] = emailAddress,
                ["public_metadata"] = publicMetadata,
                ["notify"] = notify,
                ["ignore_existing"] = ignoreExisting
            };

            if (!string.IsNullOrWhiteSpace(redirectUrl))
            {
                requestBody["redirect_url"] = redirectUrl;
            }

            var jsonContent = JsonSerializer.Serialize(requestBody, jsonOptions);
            using var request = new HttpRequestMessage(HttpMethod.Post, requestUri)
            {
                Content = new StringContent(jsonContent, Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", secretKey);

            using var response = await httpClient.SendAsync(request, ct);
            var responseContent = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("Clerk user invitation failed for {Email}. Status: {StatusCode}, Body: {Body}",
                    emailAddress, response.StatusCode, responseContent);
                return null;
            }

            using var doc = JsonDocument.Parse(responseContent);
            var root = doc.RootElement;

            var id = root.TryGetProperty("id", out var idElem) ? idElem.GetString() ?? string.Empty : string.Empty;
            var status = root.TryGetProperty("status", out var stElem) ? stElem.GetString() ?? "pending" : "pending";
            var url = root.TryGetProperty("url", out var urlElem) ? urlElem.GetString() : null;
            DateTime? createdAt = null;
            if (root.TryGetProperty("created_at", out var catElem) && catElem.TryGetInt64(out var epochMs))
            {
                createdAt = DateTimeOffset.FromUnixTimeMilliseconds(epochMs).UtcDateTime;
            }

            logger.LogInformation("Successfully created Clerk user invitation {InvitationId} for {Email}", id, emailAddress);

            return new ClerkInvitationResult(
                Id: id,
                EmailAddress: emailAddress,
                Status: status,
                Url: url,
                CreatedAt: createdAt ?? DateTime.UtcNow
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected exception creating Clerk user invitation for {Email}", emailAddress);
            return null;
        }
    }

    public async Task<bool> RevokeInvitationAsync(string invitationId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(invitationId) || invitationId.StartsWith("inv_mock_"))
        {
            return true;
        }

        var secretKey = configuration["Clerk:SecretKey"];
        var baseUrl = configuration["Clerk:ApiBaseUrl"]?.TrimEnd('/') ?? "https://api.clerk.com/v1";

        if (string.IsNullOrWhiteSpace(secretKey) || secretKey.Contains("placeholder"))
        {
            return true;
        }

        try
        {
            var requestUri = $"{baseUrl}/invitations/{Uri.EscapeDataString(invitationId)}/revoke";
            using var request = new HttpRequestMessage(HttpMethod.Post, requestUri);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", secretKey);

            using var response = await httpClient.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Failed to revoke Clerk invitation {InvitationId}. Status: {StatusCode}",
                    invitationId, response.StatusCode);
                return false;
            }

            logger.LogInformation("Successfully revoked Clerk user invitation {InvitationId}", invitationId);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error revoking Clerk invitation {InvitationId}", invitationId);
            return false;
        }
    }
}
