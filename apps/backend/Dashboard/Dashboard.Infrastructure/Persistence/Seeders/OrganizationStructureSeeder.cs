using ERPEZ.Domain.Entities.Planning;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Infrastructure.Persistence.Seeders;

public static class OrganizationStructureSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (context.PositionTypes != null && !await context.PositionTypes.AnyAsync())
        {
            var positionTypes = new List<PositionType>
            {
                new() { Id = Guid.NewGuid(), Name = "Executive", Code = "EXEC", Description = "Executive and senior management positions", EducationalLevel = "Master's Degree or equivalent", Category = "Professional", IsCareerEligibilityRequired = true, CanReportDirectly = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Managerial", Code = "MGR", Description = "Managerial positions", EducationalLevel = "Bachelor's Degree", Category = "Professional", IsCareerEligibilityRequired = true, CanReportDirectly = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Supervisory", Code = "SUP", Description = "Supervisory positions", EducationalLevel = "Bachelor's Degree", Category = "Professional", IsCareerEligibilityRequired = true, CanReportDirectly = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Technical", Code = "TECH", Description = "Technical and specialized positions", EducationalLevel = "Bachelor's Degree in technical field", Category = "Professional", IsCareerEligibilityRequired = false, CanReportDirectly = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Administrative", Code = "ADMIN", Description = "Administrative and clerical positions", EducationalLevel = "High School or equivalent", Category = "Non-Professional", IsCareerEligibilityRequired = false, CanReportDirectly = false, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Support", Code = "SUPP", Description = "Support and service positions", EducationalLevel = "High School", Category = "Non-Professional", IsCareerEligibilityRequired = false, CanReportDirectly = false, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Skilled Worker", Code = "SKILL", Description = "Skilled positions", EducationalLevel = "Vocational Certificate", Category = "Non-Professional", IsCareerEligibilityRequired = false, CanReportDirectly = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Unskilled Worker", Code = "UNSKILL", Description = "Unskilled positions", EducationalLevel = "Elementary", Category = "Non-Professional", IsCareerEligibilityRequired = false, CanReportDirectly = false, IsActive = true }
            };
            await context.PositionTypes.AddRangeAsync(positionTypes);
        }

        if (context.PlantillaTypes != null && !await context.PlantillaTypes.AnyAsync())
        {
            var plantillaTypes = new List<PlantillaType>
            {
                new() { Id = Guid.NewGuid(), Name = "Permanent", Code = "PERM", Duration = null, RequiresActingAppointments = false, AllowsContractual = false, IsActive = true, Benefits = "[\"GSIS\",\"PhilHealth\",\"PAG-IBIG\"]" },
                new() { Id = Guid.NewGuid(), Name = "Casual", Code = "CASUAL", Duration = 6, RequiresActingAppointments = false, AllowsContractual = true, IsActive = true, Benefits = "[]" },
                new() { Id = Guid.NewGuid(), Name = "Contractual", Code = "CONT", Duration = 12, RequiresActingAppointments = false, AllowsContractual = false, IsActive = true, Benefits = "[\"PhilHealth\"]" },
                new() { Id = Guid.NewGuid(), Name = "Coterminous", Code = "COTERM", Duration = 48, RequiresActingAppointments = false, AllowsContractual = false, IsActive = true, Benefits = "[\"GSIS\",\"PhilHealth\",\"PAG-IBIG\"]" },
                new() { Id = Guid.NewGuid(), Name = "Job Order", Code = "JO", Duration = 6, RequiresActingAppointments = false, AllowsContractual = true, IsActive = true, Benefits = "[]" },
                new() { Id = Guid.NewGuid(), Name = "COS", Code = "COS", Duration = 12, RequiresActingAppointments = false, AllowsContractual = false, IsActive = true, Benefits = "[]" },
                new() { Id = Guid.NewGuid(), Name = "Elected", Code = "ELECT", Duration = 36, RequiresActingAppointments = false, AllowsContractual = false, IsActive = true, Benefits = "[\"GSIS\",\"PhilHealth\",\"PAG-IBIG\"]" },
                new() { Id = Guid.NewGuid(), Name = "Appointed", Code = "APPOINT", Duration = 72, RequiresActingAppointments = false, AllowsContractual = false, IsActive = true, Benefits = "[\"GSIS\",\"PhilHealth\",\"PAG-IBIG\"]" }
            };
            await context.PlantillaTypes.AddRangeAsync(plantillaTypes);
        }

        if (context.SalaryGrades != null && !await context.SalaryGrades.AnyAsync())
        {
            var salaryGrades = new List<SalaryGrade>();
            for (int i = 1; i <= 33; i++)
            {
                salaryGrades.Add(new SalaryGrade
                {
                    Id = Guid.NewGuid(),
                    Name = $"SG-{i}",
                    Code = $"SG-{i}",
                    GradeNumber = i,
                    NumberOfSteps = 8,
                    EffectiveDate = new DateOnly(2024, 1, 1),
                    StepIncrementAmount = 500m * i,
                    Description = $"Salary Grade {i}",
                    IsActive = true
                });
            }
            await context.SalaryGrades.AddRangeAsync(salaryGrades);
        }

        if (context.Steps != null && !await context.Steps.AnyAsync())
        {
            var steps = new List<Step>();
            for (int s = 1; s <= 8; s++)
            {
                steps.Add(new Step
                {
                    Id = Guid.NewGuid(),
                    Name = $"Step {s}",
                    Code = $"STEP-{s}",
                    StepNumber = s,
                    MinStep = 1,
                    MaxStep = 8,
                    Description = $"Step {s} of salary progression",
                    IsActive = true
                });
            }
            await context.Steps.AddRangeAsync(steps);
        }

        if (context.OfficeTypes != null && !await context.OfficeTypes.AnyAsync())
        {
            var officeTypes = new List<OfficeType>
            {
                new() { Id = Guid.NewGuid(), Name = "Office", Code = "OFF", CanHaveChildren = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Division", Code = "DIV", CanHaveChildren = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Section", Code = "SEC", CanHaveChildren = false, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Department", Code = "DEPT", CanHaveChildren = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Bureau", Code = "BURE", CanHaveChildren = true, IsActive = true }
            };
            await context.OfficeTypes.AddRangeAsync(officeTypes);
        }

        if (context.Categories != null && !await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new() { Id = Guid.NewGuid(), Name = "Administrative", Code = "ADMIN", CanHaveChildren = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Technical", Code = "TECH", CanHaveChildren = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Delivery", Code = "DELIV", CanHaveChildren = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Executive", Code = "EXEC", CanHaveChildren = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Regulatory", Code = "REG", CanHaveChildren = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Support", Code = "SUP", CanHaveChildren = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Oversight", Code = "OVER", CanHaveChildren = true, IsActive = true }
            };
            await context.Categories.AddRangeAsync(categories);
        }

        if (context.AdministrativeLevels != null && !await context.AdministrativeLevels.AnyAsync())
        {
            var adminLevels = new List<AdministrativeLevel>
            {
                new() { Id = Guid.NewGuid(), Name = "National", Code = "NAT", CanHaveChildren = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Regional", Code = "REG", CanHaveChildren = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Division", Code = "DIV", CanHaveChildren = true, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Section", Code = "SEC", CanHaveChildren = false, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Unit", Code = "UNIT", CanHaveChildren = false, IsActive = true }
            };
            await context.AdministrativeLevels.AddRangeAsync(adminLevels);
        }

        if (context.ProcurementWorkflows != null && !await context.ProcurementWorkflows.AnyAsync())
        {
            var workflows = new List<ProcurementWorkflow>
            {
                new() { Id = Guid.NewGuid(), Name = "Centralized", Code = "CENT", ApprovalLevel = 3, IsActive = true },
                new() { Id = Guid.NewGuid(), Name = "Decentralized", Code = "DECENT", ApprovalLevel = 2, IsActive = true }
            };
            await context.ProcurementWorkflows.AddRangeAsync(workflows);
        }

        await context.SaveChangesAsync();
    }
}
