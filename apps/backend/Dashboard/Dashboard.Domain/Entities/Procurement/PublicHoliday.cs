using System;
using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

public class PublicHoliday : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly Date { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Type { get; set; } = "regular"; // "regular" | "special"

    [Sieve(CanFilter = true, CanSort = true)]
    public int Year { get; set; }
}
