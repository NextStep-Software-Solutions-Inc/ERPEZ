namespace ERPEZ.Shared.Enums;

/// <summary>
/// Projection freshness status of an upstream IdP membership into the ERPEZ control plane.
/// </summary>
public enum MembershipProjectionStatus
{
    Healthy = 0,
    Stale = 1,
    Degraded = 2
}
