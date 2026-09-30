using System;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Dashboard.Dtos;
using ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetDashboardAnalytics;
using ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetDashboardBottleneck;
using ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetDashboardScorecard;
using ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetDashboardSummary;
using ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetContractRisk;
using ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetBudgetBurnAnalytics;
using ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetSupplierPerformanceDetail;
using ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetProcurementAuditTrail;
using ERPEZ.Application.Features.Procurement.Dashboard.Queries.Reports;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("procurement/dashboard")]
[ApiController]
[Authorize]
public class ProcurementDashboardController(ISender mediator) : ControllerBase
{
    // ── Core Overview & Analytics Endpoints ────────────────────────────────────

    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<ProcurementDashboardSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary(
        [FromQuery] int fiscalYear,
        [FromQuery] Guid? officeId = null,
        [FromQuery] int? quarter = null,
        [FromQuery] string? procurementMode = null,
        [FromQuery] DateOnly? dateFrom = null,
        [FromQuery] DateOnly? dateTo = null,
        [FromQuery] string? status = null)
    {
        var result = await mediator.Send(new GetDashboardSummaryQuery
        {
            FiscalYear = fiscalYear == 0 ? DateTime.UtcNow.Year : fiscalYear,
            OfficeId = officeId,
            Quarter = quarter,
            ProcurementMode = procurementMode,
            DateFrom = dateFrom,
            DateTo = dateTo,
            Status = status
        });

        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("scorecard")]
    [ProducesResponseType(typeof(ApiResponse<ProcurementHealthScorecardDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetScorecard(
        [FromQuery] int fiscalYear,
        [FromQuery] Guid? officeId = null,
        [FromQuery] int? quarter = null,
        [FromQuery] string? procurementMode = null,
        [FromQuery] DateOnly? dateFrom = null,
        [FromQuery] DateOnly? dateTo = null,
        [FromQuery] string? status = null)
    {
        var result = await mediator.Send(new GetDashboardScorecardQuery
        {
            FiscalYear = fiscalYear == 0 ? DateTime.UtcNow.Year : fiscalYear,
            OfficeId = officeId,
            Quarter = quarter,
            ProcurementMode = procurementMode,
            DateFrom = dateFrom,
            DateTo = dateTo,
            Status = status
        });

        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("bottleneck")]
    [ProducesResponseType(typeof(ApiResponse<ProcurementBottleneckDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBottleneck(
        [FromQuery] int fiscalYear,
        [FromQuery] Guid? officeId = null,
        [FromQuery] int? quarter = null,
        [FromQuery] string? procurementMode = null,
        [FromQuery] DateOnly? dateFrom = null,
        [FromQuery] DateOnly? dateTo = null,
        [FromQuery] string? status = null)
    {
        var result = await mediator.Send(new GetDashboardBottleneckQuery
        {
            FiscalYear = fiscalYear == 0 ? DateTime.UtcNow.Year : fiscalYear,
            OfficeId = officeId,
            Quarter = quarter,
            ProcurementMode = procurementMode,
            DateFrom = dateFrom,
            DateTo = dateTo,
            Status = status
        });

        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("analytics")]
    [ProducesResponseType(typeof(ApiResponse<ProcurementDashboardAnalyticsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAnalytics(
        [FromQuery] int fiscalYear,
        [FromQuery] Guid? officeId = null,
        [FromQuery] int? quarter = null,
        [FromQuery] string? procurementMode = null,
        [FromQuery] DateOnly? dateFrom = null,
        [FromQuery] DateOnly? dateTo = null,
        [FromQuery] string? status = null)
    {
        var result = await mediator.Send(new GetDashboardAnalyticsQuery
        {
            FiscalYear = fiscalYear == 0 ? DateTime.UtcNow.Year : fiscalYear,
            OfficeId = officeId,
            Quarter = quarter,
            ProcurementMode = procurementMode,
            DateFrom = dateFrom,
            DateTo = dateTo,
            Status = status
        });

        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("contract-risk")]
    [ProducesResponseType(typeof(ApiResponse<ProcurementContractRiskDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetContractRisk(
        [FromQuery] int fiscalYear,
        [FromQuery] Guid? officeId = null,
        [FromQuery] int? quarter = null,
        [FromQuery] string? procurementMode = null,
        [FromQuery] DateOnly? dateFrom = null,
        [FromQuery] DateOnly? dateTo = null,
        [FromQuery] string? status = null)
    {
        var result = await mediator.Send(new GetContractRiskQuery
        {
            FiscalYear = fiscalYear == 0 ? DateTime.UtcNow.Year : fiscalYear,
            OfficeId = officeId,
            Quarter = quarter,
            ProcurementMode = procurementMode,
            DateFrom = dateFrom,
            DateTo = dateTo,
            Status = status
        });

        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("budget-burn")]
    [ProducesResponseType(typeof(ApiResponse<BudgetBurnAnalyticsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBudgetBurn(
        [FromQuery] int fiscalYear,
        [FromQuery] Guid? officeId = null)
    {
        var result = await mediator.Send(new GetBudgetBurnAnalyticsQuery
        {
            FiscalYear = fiscalYear == 0 ? DateTime.UtcNow.Year : fiscalYear,
            OfficeId = officeId
        });

        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("supplier-performance/{supplierId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<SupplierPerformanceDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSupplierPerformance([FromRoute] Guid supplierId)
    {
        var result = await mediator.Send(new GetSupplierPerformanceDetailQuery(supplierId));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpGet("audit-trail")]
    [ProducesResponseType(typeof(ApiResponse<List<ProcurementAuditLogItemDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditTrail([FromQuery] int limit = 20)
    {
        var result = await mediator.Send(new GetProcurementAuditTrailQuery(limit));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    // ── 9 Paginated Report Table Endpoints ─────────────────────────────────────

    [HttpGet("reports/purchase-requests")]
    [ProducesResponseType(typeof(PaginatedApiResponse<PRReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPRReport([FromQuery] GetPRReportQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("reports/consolidated-prs")]
    [ProducesResponseType(typeof(PaginatedApiResponse<ConsolidatedPRReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetConsolidatedPRReport([FromQuery] GetConsolidatedPRReportQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("reports/rfqs")]
    [ProducesResponseType(typeof(PaginatedApiResponse<RFQReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRFQReport([FromQuery] GetRFQReportQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("reports/notices-of-award")]
    [ProducesResponseType(typeof(PaginatedApiResponse<NOAReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNOAReport([FromQuery] GetNOAReportQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("reports/notices-to-proceed")]
    [ProducesResponseType(typeof(PaginatedApiResponse<NTPReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNTPReport([FromQuery] GetNTPReportQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("reports/purchase-orders")]
    [ProducesResponseType(typeof(PaginatedApiResponse<POReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPOReport([FromQuery] GetPOReportQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("reports/contracts")]
    [ProducesResponseType(typeof(PaginatedApiResponse<ContractReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetContractReport([FromQuery] GetContractReportQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("reports/direct-contracting")]
    [ProducesResponseType(typeof(PaginatedApiResponse<DirectContractingReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDirectContractingReport([FromQuery] GetDirectContractingReportQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("reports/direct-acquisition")]
    [ProducesResponseType(typeof(PaginatedApiResponse<DirectAcquisitionReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDirectAcquisitionReport([FromQuery] GetDirectAcquisitionReportQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }
}
