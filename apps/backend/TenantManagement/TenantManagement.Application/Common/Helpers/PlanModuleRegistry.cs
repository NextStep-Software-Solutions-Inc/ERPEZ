using ERPEZ.TenantManagement.Domain.Enums;

namespace ERPEZ.TenantManagement.Application.Common.Helpers;

public static class PlanModuleRegistry
{
    public const string moduleAms = "ams";
    public const string moduleSams = "sams";
    public const string modulePms = "pms";
    public const string modulePbms = "pbms";

    private static readonly string[] starterModules = [moduleAms, moduleSams];
    private static readonly string[] professionalModules = [moduleAms, moduleSams, modulePms];
    private static readonly string[] enterpriseModules = [moduleAms, moduleSams, modulePms, modulePbms];

    public static IReadOnlyList<string> GetModuleKeysForPlan(Plan plan)
    {
        return plan switch
        {
            Plan.Starter => starterModules,
            Plan.Professional => professionalModules,
            Plan.Enterprise or Plan.OnPremise => enterpriseModules,
            _ => starterModules
        };
    }

    public static decimal GetPlanPrice(Plan plan, BillingCycle cycle, bool isAirGapped)
    {
        if (isAirGapped)
        {
            // On-Premise sovereign plans are billed annually
            return plan switch
            {
                Plan.Starter => 1499m,
                Plan.Professional => 4999m,
                Plan.Enterprise or Plan.OnPremise => 12000m,
                _ => 1499m
            };
        }

        // Cloud SaaS plans
        if (cycle == BillingCycle.Yearly)
        {
            return plan switch
            {
                Plan.Starter => 980m,
                Plan.Professional => 2990m,
                Plan.Enterprise or Plan.OnPremise => 5990m,
                _ => 980m
            };
        }

        return plan switch
        {
            Plan.Starter => 99m,
            Plan.Professional => 299m,
            Plan.Enterprise or Plan.OnPremise => 599m,
            _ => 99m
        };
    }

    public static (int maxTenants, int maxUsers) GetPlanCapacity(Plan plan, bool isAirGapped)
    {
        if (isAirGapped)
        {
            return plan switch
            {
                Plan.Starter => (1, 25),
                Plan.Professional => (3, 100),
                Plan.Enterprise or Plan.OnPremise => (999, 9999),
                _ => (1, 25)
            };
        }

        return plan switch
        {
            Plan.Starter => (1, 15),
            Plan.Professional => (1, 50),
            Plan.Enterprise or Plan.OnPremise => (10, 500),
            _ => (1, 15)
        };
    }
}
