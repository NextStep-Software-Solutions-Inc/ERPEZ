using ERPEZ.Api;
using ERPEZ.Api.Extensions;
using ERPEZ.Application;
using ERPEZ.Infrastructure;
using Hangfire;

var builder = WebApplication.CreateBuilder(args);
var env = builder.Environment;

builder.Configuration.AddJsonFile("appsettings.json", false, true);
builder.Configuration.AddJsonFile($"appsettings.{env.EnvironmentName}.json", true, true);
builder.Configuration.AddUserSecrets(typeof(Program).Assembly, true);

// 1. Add services from our other layers
builder.Services
    .AddApiServices()
    .AddApplicationServices()
    .AddInfrastructureServices(builder.Configuration, builder.Environment);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (env.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 4. Add middleware
app.UseApiMiddlewares();

// 5. Tell the app to use controllers
app.MapControllers();

app.Run();