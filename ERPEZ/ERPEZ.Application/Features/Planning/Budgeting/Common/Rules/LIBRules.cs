using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.Budgeting.Common.Rules;

public static class LIBRules
{
    public static readonly string[] EditableStatuses =
    [
        nameof(LIBStatus.Draft),
        nameof(LIBStatus.Proposed),
        nameof(LIBStatus.Returned)
    ];

    public static bool IsEditable(string status) =>
        EditableStatuses.Any(s => status.Equals(s, StringComparison.OrdinalIgnoreCase));
}