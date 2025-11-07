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
bool isDevelopment = app.Environment.IsDevelopment();
// Configure the HTTP request pipeline.
if (isDevelopment)
{
    app.UseSwagger();
    app.UseSwaggerUI(s =>
    {
        s.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        s.ConfigObject.AdditionalItems.Add("persistAuthorization", "true");
        s.ConfigObject.DeepLinking = true;
        s.ConfigObject.DisplayRequestDuration = true;
    });
}

// 4. Add middleware
app.UseCors(environment.EnvironmentName.ToLower()); // Use CORS policy based on environment
app.UseHttpsRedirection();
app.UseExceptionHandler();
app.UseHangfireDashboard();
app.UseCors(isDevelopment ? "development" : "production");

// 5. Tell the app to use controllers
app.MapControllers();

app.Run();