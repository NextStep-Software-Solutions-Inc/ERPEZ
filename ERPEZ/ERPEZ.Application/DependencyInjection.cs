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


        return services;
    }
}