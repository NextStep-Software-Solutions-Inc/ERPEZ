namespace ERPEZ.Domain.Common;

/// <summary>
/// Interface for entities that require approval workflow (Status, SubmittedDate, ApprovedDate)
/// </summary>
public interface IApprovable
{
    string Status { get; set; }
    DateTime? SubmittedDate { get; set; }
    DateTime? ApprovedDate { get; set; }
}
