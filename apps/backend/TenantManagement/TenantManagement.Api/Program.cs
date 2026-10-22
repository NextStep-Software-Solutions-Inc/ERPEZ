using ERPEZ.TenantManagement.Api;
using ERPEZ.TenantManagement.Api.Extensions;
using ERPEZ.TenantManagement.Application;
using ERPEZ.TenantManagement.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.ConfigureAppConfiguration();

builder
    .AddApiServices()
    .AddApplicationServices()
    .AddInfrastructureServices();

var app = builder.Build();

app.UseApiMiddlewares();

if (app.Environment.IsDevelopment())
{
    app.MapGet("/", () => Results.Redirect("/swagger")).AllowAnonymous();
}

app.MapControllers();
app.Run();
