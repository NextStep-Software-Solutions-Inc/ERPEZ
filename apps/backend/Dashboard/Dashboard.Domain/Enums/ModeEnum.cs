using System.Text.Json.Serialization;

namespace ERPEZ.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ModeEnum
{
    OPCR,
    External
}
