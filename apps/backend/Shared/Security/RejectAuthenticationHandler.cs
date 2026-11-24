using System.Text.Encodings.Web;
using System.Text.Json;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ERPEZ.Shared.Security;

/// <summary>
/// Terminal authentication handler invoked when an unknown or unsupported issuer is encountered.
/// Returns a terminal 401 Unauthorized response and prevents fallthrough to other identity providers.
/// </summary>
public class RejectAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string schemeName = AuthSchemes.rejectScheme;
    public static string SchemeName => schemeName;

    protected override Task<AuthenticateResult> HandleAuthenticateAsync() =>
        Task.FromResult(AuthenticateResult.Fail("Unrecognized or unsupported token issuer."));

    protected override async Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = StatusCodes.Status401Unauthorized;
        Response.ContentType = "application/json";
        var error = ApiResponse<object>.Fail("Invalid or unsupported token issuer.");
        await Response.WriteAsync(JsonSerializer.Serialize(error));
    }
}
