using ERPEZ.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Infrastructure.Services;

public class TempFileCleanupService(IServiceProvider serviceProvider, ILogger<TempFileCleanupService> logger) : BackgroundService
{
    private readonly TimeSpan checkInterval = TimeSpan.FromMinutes(5);
    private readonly TimeSpan retentionPeriod = TimeSpan.FromMinutes(10);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Temp File Cleanup Service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = serviceProvider.CreateScope();
                var fileStorageService = scope.ServiceProvider.GetRequiredService<IFileStorageService>();
                await fileStorageService.DeleteExpiredTempFilesAsync(retentionPeriod);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while cleaning up temp files.");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }

        logger.LogInformation("Temp File Cleanup Service stopped.");
    }
}
