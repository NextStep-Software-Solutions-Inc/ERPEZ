using ERPEZ.Api;
using ERPEZ.Api.Extensions;
using ERPEZ.Application;
using ERPEZ.Infrastructure;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence.Seeders;

var builder = WebApplication.CreateBuilder(args);
builder.ConfigureAppConfiguration();

// Last verified depot list: May 2026
// TODO: Consider adding IMemoryCache for categories and depots (low-churn endpoints)
//       if PhilGEPS response times become a performance concern.
builder.Services.AddHttpClient("psdbm", c =>
{
    c.Timeout = TimeSpan.FromSeconds(20);
    c.DefaultRequestHeaders.UserAgent.ParseAdd("ERPEZ/1.0"); // ✅ fix #2
});

builder
    .AddApiServices()
    .AddApplicationServices();

await builder.AddInfrastructureServices();

var app = builder.Build();
// Seed GPPB-standard procurement activity types (idempotent)
using (var scope = app.Services.CreateScope())
{
    var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
    await ProcurementActivityTypeSeeder.SeedAsync(unitOfWork);
}

app.UseApiMiddlewares();

app.MapControllers();

app.Run();
