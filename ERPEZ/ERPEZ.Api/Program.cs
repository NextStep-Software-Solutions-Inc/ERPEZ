using ERPEZ.Api;
using ERPEZ.Api.Extensions;
using ERPEZ.Application;
using ERPEZ.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.ConfigureAppConfiguration();

builder.Services.AddHttpClient();

builder
    .AddApiServices()
    .AddApplicationServices();

await builder.AddInfrastructureServices();

var app = builder.Build();

app.UseApiMiddlewares();

app.MapControllers();

app.Run();
