using ERPEZ.Shared.Exceptions;

namespace ERPEZ.Application.Common.Exceptions;

/// <summary>
/// Thrown when a save operation fails due to a uniqueness/concurrency conflict
/// (e.g. duplicate APRNumber under near-simultaneous submissions). Infrastructure
/// translates EF Core's DbUpdateException into this before it crosses into Application.
/// </summary>
public class ConcurrencyConflictException : ConflictException
{
    public ConcurrencyConflictException() : base("A save conflict occurred.") { }
    public ConcurrencyConflictException(string message) : base(message) { }
    public ConcurrencyConflictException(string message, Exception inner) : base(message, inner) { }
}
