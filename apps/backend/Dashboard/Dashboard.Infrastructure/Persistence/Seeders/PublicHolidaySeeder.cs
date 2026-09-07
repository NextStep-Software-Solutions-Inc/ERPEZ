using System;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;

namespace ERPEZ.Infrastructure.Persistence.Seeders;

public static class PublicHolidaySeeder
{
    private static readonly (DateOnly Date, string Name, string Type)[] seeds =
    [
        (new DateOnly(2026, 1, 1), "New Year's Day", "regular"),
        (new DateOnly(2026, 4, 2), "Maundy Thursday", "regular"),
        (new DateOnly(2026, 4, 3), "Good Friday", "regular"),
        (new DateOnly(2026, 4, 4), "Black Saturday", "special"),
        (new DateOnly(2026, 4, 9), "Araw ng Kagitingan", "regular"),
        (new DateOnly(2026, 5, 1), "Labor Day", "regular"),
        (new DateOnly(2026, 6, 12), "Independence Day", "regular"),
        (new DateOnly(2026, 8, 27), "National Heroes Day", "regular"),
        (new DateOnly(2026, 11, 1), "All Saints Day", "special"),
        (new DateOnly(2026, 11, 2), "All Souls Day", "special"),
        (new DateOnly(2026, 11, 30), "Bonifacio Day", "regular"),
        (new DateOnly(2026, 12, 8), "Feast of the Immaculate Conception", "special"),
        (new DateOnly(2026, 12, 24), "Christmas Eve", "special"),
        (new DateOnly(2026, 12, 25), "Christmas Day", "regular"),
        (new DateOnly(2026, 12, 30), "Rizal Day", "regular"),
        (new DateOnly(2026, 12, 31), "New Year's Eve", "special"),
    ];

    public static async Task SeedAsync(IUnitOfWork unitOfWork)
    {
        foreach (var (date, name, type) in seeds)
        {
            var existing = await unitOfWork.PublicHolidayRepository
                .FindAsync(h => h.Date == date);

            if (existing != null)
                continue;

            var entity = new PublicHoliday
            {
                Date = date,
                Name = name,
                Type = type,
                Year = date.Year
            };

            await unitOfWork.PublicHolidayRepository.AddAsync(entity);
        }

        await unitOfWork.SaveChangesAsync();
    }
}
