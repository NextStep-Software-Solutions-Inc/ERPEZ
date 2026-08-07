using ERPEZ.Shared.Exceptions;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands;

internal static class ChecklistLockGuard
{
    private static readonly HashSet<string> lockedStatuses =
    [
        "Posted",
        "Bidding Open",
        "Bid Evaluation",
        "Post-Qualification",
        "Award",
        "Contract Preparation",
        "Contract Execution"
    ];

    internal static void ThrowIfLocked(string projectStatus)
    {
        if (lockedStatuses.Contains(projectStatus))
            throw new ConflictException(
                $"The project checklist cannot be modified because the project status is '{projectStatus}'. " +
                "Modifications are only allowed before the project is posted.");
    }

    internal static bool IsLocked(string projectStatus) =>
        lockedStatuses.Contains(projectStatus);
}