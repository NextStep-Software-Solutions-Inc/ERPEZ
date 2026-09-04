using ERPEZ.Api;
using ERPEZ.Api.Extensions;
using ERPEZ.Application;
using ERPEZ.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.ConfigureAppConfiguration();

// Last verified depot list: May 2026
// TODO: Consider adding IMemoryCache for categories and depots (low-churn endpoints)
//       if PhilGEPS response times become a performance concern.
builder.Services.AddHttpClient("psdbm", c =>
{
    c.Timeout = TimeSpan.FromSeconds(20);
    c.DefaultRequestHeaders.UserAgent.ParseAdd("ERPEZ/1.0");
});

builder
    .AddApiServices()
    .AddApplicationServices();

await builder.AddInfrastructureServices();
ERPEZ.TenantManagement.Infrastructure.DependencyInjection.AddInfrastructureServices(builder);

var app = builder.Build();

// Seed master & prerequisite test data on startup (idempotent)
using (var scope = app.Services.CreateScope())
{
    var unitOfWork = scope.ServiceProvider.GetRequiredService<ERPEZ.Domain.Interfaces.IUnitOfWork>();
    var dbContext = scope.ServiceProvider.GetRequiredService<ERPEZ.Infrastructure.Persistence.ApplicationDbContext>();
    await ERPEZ.Infrastructure.Persistence.Seeders.ProcurementTestDataSeeder.SeedAllAsync(dbContext, unitOfWork);
}

app.UseApiMiddlewares();

app.MapControllers();

app.Run();

