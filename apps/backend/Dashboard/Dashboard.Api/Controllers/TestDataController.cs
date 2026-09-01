using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Infrastructure.Persistence.Seeders;
using ERPEZ.Shared.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Api.Controllers;

[Route("api/test-data")]
[ApiController]
public class TestDataController(ApplicationDbContext context, IUnitOfWork unitOfWork) : ControllerBase
{
    /// <summary>
    /// Seeds prerequisite planning, budgeting, PPMP, and supplier registry test data.
    /// </summary>
    [HttpPost("seed-procurement")]
    public async Task<IActionResult> SeedProcurementData()
    {
        await ProcurementTestDataSeeder.SeedAllAsync(context, unitOfWork);
        return Ok(ApiResponse<string>.Success("Procurement and planning prerequisite test data seeded successfully."));
    }

    /// <summary>
    /// Seeds public bidding projects, document checklists, and sample public supplier applications.
    /// </summary>
    [HttpPost("seed-public-bidding")]
    public async Task<IActionResult> SeedPublicBiddingData()
    {
        await ProcurementTestDataSeeder.SeedPublicBiddingPortalAsync(context, unitOfWork);
        return Ok(ApiResponse<string>.Success("Public bidding portal test data seeded successfully."));
    }

    /// <summary>
    /// Returns summary counts of seeded prerequisite entities in the database.
    /// </summary>
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = new
        {
            FiscalYears = await context.FiscalYears!.CountAsync(),
            Offices = await context.Offices!.CountAsync(),
            FundSources = await context.FundSources!.CountAsync(),
            ProcurementModes = await context.ProcurementModes!.CountAsync(),
            SupplierCategories = await context.SupplierCategories!.CountAsync(),
            Suppliers = await context.Suppliers!.CountAsync(),
            WFPs = await context.WFPs!.CountAsync(),
            LineItemBudgets = await context.LineItemBudgets!.CountAsync(),
            PPMPs = await context.PPMPs!.CountAsync(),
            PPMPItems = await context.PPMPItems!.CountAsync(),
            PurchaseRequests = await context.PurchaseRequests!.CountAsync(),
            ConsolidatedPRs = await context.ConsolidatedPRs!.CountAsync(),
            RFQs = await context.RFQs!.CountAsync(),
            AOBs = await context.AOBs!.CountAsync(),
            ProcurementProjects = await context.ProcurementProjects!.CountAsync(),
            MasterDocumentTypes = await context.MasterDocumentTypes!.CountAsync(),
            PublicSupplierApplications = await context.PublicSupplierApplications!.CountAsync()
        };

        return Ok(ApiResponse<object>.Success(summary, "Test data entity summary retrieved."));
    }
}
