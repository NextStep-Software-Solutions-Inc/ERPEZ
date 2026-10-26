namespace ERPEZ.Application.Common.Dtos.AMS;

public class LicenseStatusDto
{
    public bool IsValid { get; set; }
    public string Plan { get; set; } = "Starter";
    public string LicenseKey { get; set; } = string.Empty;
    public string AllowedDomain { get; set; } = string.Empty;
    public int MaxUsers { get; set; } = 50;
    public int ActiveUsersCount { get; set; }
    public int RemainingDays { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public IReadOnlyList<string> EnabledModules { get; set; } = [];
    public string? Message { get; set; }
    public bool IsAirGapped { get; set; }
}

public class LicenseActivationResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public LicenseStatusDto? Status { get; set; }
}
