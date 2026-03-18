using Microsoft.Extensions.DependencyInjection;
using Sieve.Services;
using System.Reflection;
using FluentValidation;
using ERPEZ.Application.Common.Behaviors;
using ERPEZ.Application.Common.Services;
using ERPEZ.Application.Common.Sieve;
using ERPEZ.Application.Features.Planning.KPIAssignment.Validators;
using ERPEZ.Domain.Interfaces;
using Microsoft.AspNetCore.Builder;
using Sieve.Models;

namespace ERPEZ.Application;

public static class DependencyInjection
{
    public static WebApplicationBuilder AddApplicationServices(this WebApplicationBuilder builder)
    {
        var assembly = Assembly.GetExecutingAssembly();

        builder.Services.Configure<SieveOptions>(options => { });
        builder.Services.AddScoped<ISieveProcessor, ApplicationSieveProcessor>();

        // Register PIN hashing service
        builder.Services.AddScoped<IPINHashingService, PINHashingService>();

        // Register KPI Assignment behavior validator
        builder.Services.AddScoped<IKPIAssignmentBehaviorValidator, KPIAssignmentBehaviorValidator>();

        // Register transaction code generator service

        builder.Services.AddMediatR(config =>
        {
            config.RegisterServicesFromAssembly(assembly);

            config.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        builder.Services.AddValidatorsFromAssembly(assembly);

        return builder;
    }
}
