namespace ERPEZ.Domain.Common;

using ERPEZ.Domain.Enums;

/// <summary>
/// Interface for entities that require approval workflow (Status, SubmittedDate, ApprovedDate)
/// </summary>
public interface IApprovable
{
    StatusEnum Status { get; set; }
    DateTime? SubmittedDate { get; set; }
    DateTime? ApprovedDate { get; set; }
}
