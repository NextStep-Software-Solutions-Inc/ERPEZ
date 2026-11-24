namespace ERPEZ.Domain.Enums;

/// <summary>
/// Lifecycle status for Notice to Proceed (NTP) under RA 12009 Section 66.
/// Represents direct progression from creation/drafting to official issuance,
/// contractor receipt/acknowledgment (conforme), or administrative cancellation.
/// </summary>
public enum NoticeToProceedStatus
{
    Draft,
    Issued,
    Received,
    Cancelled
}
