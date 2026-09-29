namespace ERPEZ.Shared.Configuration;

public static class DevelopmentAuthDefaults
{
    public const string devSigningKey = "ERPEZ_Development_Symmetric_Signing_Key_2026_Secure_Secret_12345!";
    public const string devIssuer = "https://erpez.dev/auth";
    public const string devAudience = "erpez-api";

    public static string DevSigningKey => devSigningKey;
    public static string DevIssuer => devIssuer;
    public static string DevAudience => devAudience;
}
