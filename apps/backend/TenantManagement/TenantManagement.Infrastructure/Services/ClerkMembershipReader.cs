using System.Net.Http.Headers;
using System.Text.Json;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Application.Common.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ERPEZ.TenantManagement.Infrastructure.Services;

public class ClerkMembershipReader(
    HttpClient httpClient,
    IConfiguration configuration,
    ILogger<ClerkMembershipReader> logger) : IClerkMembershipReader
{
    public async Task<ClerkMembershipDto?> GetMembershipAsync(
        string externalOrgId,
        string externalUserId,
        CancellationToken ct = default)
    {
        var secretKey = configuration["Clerk:SecretKey"];
        if (string.IsNullOrWhiteSpace(secretKey))
        {
            logger.LogDebug("Clerk:SecretKey is not configured. Skipping upstream Clerk API call.");
            return null;
        }

        try
        {
            var baseUrl = configuration["Clerk:ApiBaseUrl"]?.TrimEnd('/') ?? "https://api.clerk.com/v1";
            var requestUri = $"{baseUrl}/organizations/{Uri.EscapeDataString(externalOrgId)}/memberships?user_id={Uri.EscapeDataString(externalUserId)}";

            using var request = new HttpRequestMessage(HttpMethod.Get, requestUri);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", secretKey);

            using var response = await httpClient.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Clerk API returned {StatusCode} for org {OrgId}, user {UserId}",
                    response.StatusCode, externalOrgId, externalUserId);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            // Clerk returns { data: [ { id: "...", role: "...", public_user_data: { user_id: "..." } } ], total_count: 1 }
            if (root.TryGetProperty("data", out var dataElem) && dataElem.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in dataElem.EnumerateArray())
                {
                    var role = item.TryGetProperty("role", out var r) ? r.GetString() ?? "member" : "member";
                    return new ClerkMembershipDto(externalOrgId, externalUserId, role, true);
                }
            }

            return null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to query Clerk membership for org {OrgId}, user {UserId}",
                externalOrgId, externalUserId);
            return null;
        }
    }
}
