using ERPEZ.TenantManagement.Api;
using ERPEZ.TenantManagement.Application;
using ERPEZ.TenantManagement.Infrastructure;
using Hangfire;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);
var env = builder.Environment;
builder.Configuration.AddJsonFile("appsettings.json", false, true);
builder.Configuration.AddJsonFile($"appsettings.{env.EnvironmentName}.json", true, true);
builder.Configuration.AddUserSecrets(typeof(Program).Assembly, true);

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        // 1. Check Config Keys
        options.Authority = builder.Configuration["Keycloak:Authority"];
        options.Audience = builder.Configuration["Keycloak:Audience"];

        options.TokenValidationParameters = new TokenValidationParameters
        {
            NameClaimType = ClaimTypes.NameIdentifier,

            // 2. Ensure Aud/Iss Validation is TRUE
            ValidateAudience = true,
            ValidateIssuer = true
        };

        // 3. Ensure this events block is clean (no old Clerk/AZP logic)
        options.Events = new JwtBearerEvents
        {
            // You may keep this if you added custom logic for Keycloak claims (e.g., roles)
            OnTokenValidated = context =>
            {
                // Simple example of mapping preferred_username
                var preferredUsername = context.Principal?.FindFirstValue("preferred_username");
                if (!string.IsNullOrEmpty(preferredUsername))
                {
                    var claimsIdentity = context.Principal?.Identity as ClaimsIdentity;
                    if (claimsIdentity != null)
                    {
                        claimsIdentity.AddClaim(new Claim(ClaimTypes.Name, preferredUsername));
                    }
                }
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

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
app.UseHttpsRedirection();
app.UseExceptionHandler(); // Use our global exception handler
app.UseHangfireDashboard(); // Add Hangfire Dashboard endpoint
app.UseCors(isDevelopment ? "development" : "production");

// IMPORTANT: Authentication MUST run before Authorization
app.UseAuthentication();
app.UseAuthorization();

// 5. Tell the app to use controllers
app.MapControllers();
app.Run();
