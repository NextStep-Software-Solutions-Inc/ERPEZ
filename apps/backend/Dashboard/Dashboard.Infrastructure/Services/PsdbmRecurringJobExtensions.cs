using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using Hangfire;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace ERPEZ.Infrastructure.Services;

public static class PsdbmRecurringJobExtensions
{
    public const string fullCatalogueSyncJobId = "psdbm-full-catalogue-sync";
    public const string stockSyncJobId = "psdbm-stock-sync";

    /// <summary>
    /// Registers recurring Hangfire background synchronization jobs for PS-PhilGEPS local catalogue and stock data.
    /// - Full Catalogue Sync: Daily at 2:00 AM Manila Time (0 2 * * *)
    /// - Stock Sync: 3 times daily at 8:00 AM, 12:00 PM, and 4:00 PM Manila Time (0 8,12,16 * * *)
    /// </summary>
    public static IApplicationBuilder UsePsdbmRecurringJobs(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var recurringJobManager = scope.ServiceProvider.GetService<IRecurringJobManager>();
        if (recurringJobManager == null) return app;

        var timeZone = GetPhilippineTimeZone();

        // 1. Full catalogue sync daily at 2:00 AM
        recurringJobManager.AddOrUpdate<IPsdbmSyncService>(
            fullCatalogueSyncJobId,
            service => service.SyncAsync(new PsdbmSyncRequestDto { SyncMode = PsdbmSyncMode.Full }, CancellationToken.None),
            "0 2 * * *",
            new RecurringJobOptions { TimeZone = timeZone });

        // 2. Stock sync 3 times daily (8:00 AM, 12:00 PM, 4:00 PM)
        recurringJobManager.AddOrUpdate<IPsdbmSyncService>(
            stockSyncJobId,
            service => service.SyncAsync(new PsdbmSyncRequestDto { SyncMode = PsdbmSyncMode.Stock }, CancellationToken.None),
            "0 8,12,16 * * *",
            new RecurringJobOptions { TimeZone = timeZone });

        return app;
    }

    public static TimeZoneInfo GetPhilippineTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Asia/Manila");
        }
        catch
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("Singapore Standard Time");
            }
            catch
            {
                return TimeZoneInfo.Utc;
            }
        }
    }
}
