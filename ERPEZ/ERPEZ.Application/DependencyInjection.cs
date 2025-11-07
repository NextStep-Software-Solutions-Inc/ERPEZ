using Microsoft.Extensions.DependencyInjection;
using Sieve.Services;
using System.Reflection;
using FluentValidation;
using ERPEZ.Application.Common.Behaviors;

namespace ERPEZ.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddScoped<ISieveProcessor, SieveProcessor>();

        services.AddMediatR(config =>
        {
            config.RegisterServicesFromAssembly(assembly);

            config.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

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