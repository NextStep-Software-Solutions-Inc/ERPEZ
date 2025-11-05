using FluentValidation;
using ERPEZ.TenantManagement.Application.Common.Behaviors;
using Microsoft.Extensions.DependencyInjection;
using Sieve.Services;
using System.Reflection;

namespace ERPEZ.TenantManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
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
                    .AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });

            options.AddPolicy("production", policy =>
            {
                policy
                    .WithOrigins("https://erpez-portal-pro.vercel.app")
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });
        return services;
    }
}