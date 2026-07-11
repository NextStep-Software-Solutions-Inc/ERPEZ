using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.Budgeting.Common.Rules;

public static class LIBRules
{
    private static readonly string[] editableStatuses =
    [
        nameof(LIBStatus.Draft),
        nameof(LIBStatus.Proposed),
        nameof(LIBStatus.Returned)
    ];

    public static bool IsEditable(string status) =>
        editableStatuses.Any(s => status.Equals(s, StringComparison.OrdinalIgnoreCase));
}
