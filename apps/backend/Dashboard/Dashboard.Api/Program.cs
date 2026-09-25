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
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(ERPEZ.TenantManagement.Application.Features.Roles.Commands.AssignOperationalRoles.AssignOperationalRolesCommand).Assembly);
});

var app = builder.Build();

app.UseApiMiddlewares();

if (app.Environment.IsDevelopment())
{
    app.MapGet("/", () => Results.Redirect("/swagger")).AllowAnonymous();
}

app.MapControllers();

app.Run();

