using ERPEZ.Api;
using ERPEZ.Api.Extensions;
using ERPEZ.Application;
using ERPEZ.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Centralized configuration registration (appsettings + environment + user secrets)
builder.ConfigureAppConfiguration();

builder
    .AddApiServices()
    .AddApplicationServices()
    .AddInfrastructureServices();

var app = builder.Build();

app.UseApiMiddlewares();

app.MapControllers();

app.Run();