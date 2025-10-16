using ERPEZ.Api;
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
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    // Configure UseSwaggerUI to show both documents
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/catalog/swagger.json", "1. Planning & Catalog API");
        c.SwaggerEndpoint("/swagger/ams/swagger.json", "2. AMS (Auth & Mgmt) API");
    });
}

// 4. Add middleware
app.UseHttpsRedirection();
app.UseExceptionHandler(); // Use our global exception handler
app.UseHangfireDashboard(); // Add Hangfire Dashboard endpoint

// 5. Tell the app to use controllers
app.MapControllers();

app.Run();