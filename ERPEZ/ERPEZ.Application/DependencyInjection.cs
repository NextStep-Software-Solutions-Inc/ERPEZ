using Microsoft.Extensions.DependencyInjection;
using Sieve.Services;
using System.Reflection;
using FluentValidation;
using ERPEZ.Application.Common.Behaviors;
using Microsoft.AspNetCore.Builder;

namespace ERPEZ.Application;

public static class DependencyInjection
{
    public static WebApplicationBuilder AddApplicationServices(this WebApplicationBuilder builder)
    {
        var assembly = Assembly.GetExecutingAssembly();

        builder.Services.AddScoped<ISieveProcessor, SieveProcessor>();

        builder.Services.AddMediatR(config =>
        {
            config.RegisterServicesFromAssembly(assembly);

            config.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        builder.Services.AddValidatorsFromAssembly(assembly);

        return builder;
    }
}