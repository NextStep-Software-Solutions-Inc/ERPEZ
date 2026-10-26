using FluentValidation;
using ERPEZ.TenantManagement.Application.Common.Behaviors;
using Microsoft.Extensions.DependencyInjection;
using Sieve.Services;
using System.Reflection;
using Microsoft.AspNetCore.Builder;

namespace ERPEZ.TenantManagement.Application;

public static class DependencyInjection
{
    public static WebApplicationBuilder AddApplicationServices(this WebApplicationBuilder builder)
    {
        var services = builder.Services;
        var assembly = Assembly.GetExecutingAssembly();

        services.AddScoped<ISieveProcessor, SieveProcessor>();

        // Register MediatR with pipeline behaviors
        services.AddMediatR(config =>
        {
            config.RegisterServicesFromAssembly(assembly);
            // Add validation behavior to the pipeline - runs before handlers
            config.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        // Register all FluentValidation validators from this assembly
        services.AddValidatorsFromAssembly(assembly);

        services.AddCors(options =>
        {
            options.AddPolicy("development", policy =>
            {
                policy
                    .SetIsOriginAllowed(_ => true)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });

            options.AddPolicy("production", policy =>
            {
                policy
                    .WithOrigins("https://erpez-portal-pro.vercel.app")
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });
        return builder;
    }
}
