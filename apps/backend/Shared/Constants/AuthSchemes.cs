namespace ERPEZ.Shared.Constants;

public static class AuthSchemes
{
    public const string clerkJwt = "ClerkJwt";
    public const string keycloakJwt = "KeycloakJwt";
    public const string rejectScheme = "RejectScheme";
    public const string dynamicScheme = "DynamicAuthScheme";

    public static string ClerkJwt => clerkJwt;
    public static string KeycloakJwt => keycloakJwt;
    public static string RejectScheme => rejectScheme;
    public static string DynamicScheme => dynamicScheme;
}
