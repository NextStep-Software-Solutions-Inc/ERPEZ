using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Shared.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace ERPEZ.Api.Attributes;

/// <summary>
/// Action filter attribute that restricts execution based on ERP module licensing.
/// Supported modules: 'ams', 'sams', 'pms', 'pbms'.
/// Returns 403 Forbidden with a descriptive message if the module is not unlocked under the active license.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
public class RequireModuleAttribute(string moduleCode) : Attribute, IAsyncActionFilter
{
    public string ModuleCode { get; } = moduleCode.ToLowerInvariant();

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var licenseService = context.HttpContext.RequestServices.GetRequiredService<ILicenseConsumptionService>();
        var isEnabled = await licenseService.IsModuleEnabledAsync(ModuleCode);

        if (!isEnabled)
        {
            var moduleDisplayName = GetDisplayName(ModuleCode);
            var response = ApiResponse<object>.Fail(
                $"The '{moduleDisplayName}' ({ModuleCode}) module is not active under your current license plan. " +
                "Contact your system administrator to upgrade your license.");

            context.Result = new ObjectResult(response)
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
            return;
        }

        await next();
    }

    private static string GetDisplayName(string code) => code switch
    {
        "ams" => "Account & Access Management",
        "sams" => "Planning & Organization",
        "pms" => "Procurement Management",
        "pbms" => "Performance & Budget Management",
        _ => code.ToUpperInvariant()
    };
}
