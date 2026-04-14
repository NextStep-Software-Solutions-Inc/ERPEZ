using ERPEZ.Shared.Exceptions;

namespace ERPEZ.Application.Features.Planning.Budgeting.Common;

public static class BudgetingEnumMapper
{
    public static string ToEntityValue<TEnum>(TEnum value) where TEnum : struct, Enum
        => value.ToString();

    public static TEnum ToEnum<TEnum>(string? value, string fieldName) where TEnum : struct, Enum
    {
        if (!string.IsNullOrWhiteSpace(value) && Enum.TryParse<TEnum>(value, true, out var parsed))
        {
            return parsed;
        }

        throw new ValidationException($"Invalid {fieldName} value: {value ?? "<null>"}.");
    }
}
