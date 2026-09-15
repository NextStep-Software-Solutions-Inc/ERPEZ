using Microsoft.Extensions.DependencyInjection;
using Sieve.Services;
using System.Reflection;
using FluentValidation;
using ERPEZ.Application.Common.Behaviors;
using ERPEZ.Application.Common.Services;
using ERPEZ.Application.Common.Sieve;
using ERPEZ.Application.Features.Planning.KPIAssignment.Validators;
using ERPEZ.Application.Features.Planning.OPCRItem.Validators;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Validators;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Application.Services;
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

        // Register shared RFQ document context resolver (DRY: shared between generate and notice handlers)
        builder.Services.AddScoped<IRFQDocumentContextService, RFQDocumentContextService>();

        // Register KPI Assignment behavior validator
        builder.Services.AddScoped<IKPIAssignmentBehaviorValidator, KPIAssignmentBehaviorValidator>();
        builder.Services.AddScoped<IOPCRItemTargetValidator, OPCRItemTargetValidator>();
        builder.Services.AddScoped<IOPCRPAPDepartmentOfficeValidator, OPCRPAPDepartmentOfficeValidator>();

        // Register transaction code generator service

        builder.Services.AddMediatR(config =>
        {
            config.RegisterServicesFromAssembly(assembly);

            config.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        try
        {
            builder.Services.AddValidatorsFromAssembly(assembly);
        }
        catch (System.Reflection.ReflectionTypeLoadException ex)
        {
            var loaderExceptions = ex.LoaderExceptions ?? Array.Empty<Exception>();
            var errorMessages = new System.Text.StringBuilder();
            errorMessages.AppendLine("=== REFLECTION TYPE LOAD EXCEPTION ===");
            errorMessages.AppendLine($"Number of loader exceptions: {loaderExceptions.Length}");
            errorMessages.AppendLine();

            foreach (var loaderException in loaderExceptions)
            {
                errorMessages.AppendLine($"Exception Type: {loaderException?.GetType().Name}");
                errorMessages.AppendLine($"Message: {loaderException?.Message}");
                errorMessages.AppendLine($"Stack Trace: {loaderException?.StackTrace}");
                errorMessages.AppendLine("---");
            }

            // Also try to get the Types that were loaded
            if (ex.Types != null)
            {
                errorMessages.AppendLine($"Types successfully loaded: {ex.Types.Length}");
            }

            throw new InvalidOperationException(errorMessages.ToString(), ex);
        }

        return builder;
    }
}
