using System.Text.Json.Serialization;

namespace ERPEZ.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AllocationMonthEnum
{
    January,
    February,
    March,
    April,
    May,
    June,
    July,
    August,
    September,
    October,
    November,
    December
}
