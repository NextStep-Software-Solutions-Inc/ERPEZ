using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.RequestQuote;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.ScheduleDemo;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.SubscribeNewsletter;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.UpdateInquiryStatus;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Common;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Queries.GetInquiries;
using ERPEZ.TenantManagement.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.TenantManagement.Api.Controllers;

[ApiController]
[Route("inquiries")]
public class InquiriesController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Processes public quote requests for tailored scope, user limits, and deployment architectures.
    /// </summary>
    [HttpPost("quote")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<QuoteResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<QuoteResponseDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RequestQuote([FromBody] RequestQuoteCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Registers public visitor email subscription for release, security, and product updates.
    /// </summary>
    [HttpPost("subscribe")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeNewsletterCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Schedules a platform demonstration with the ERP-EZ solutions architecture team.
    /// </summary>
    [HttpPost("demo")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<DemoResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<DemoResponseDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ScheduleDemo([FromBody] ScheduleDemoCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Retrieves all quotes, scheduled demos, and newsletter leads for platform administrators.
    /// Supports optional filtering by inquiry type, status, and search term.
    /// </summary>
    [HttpGet]
    [Authorize]
    [HasPermission(PlatformPermissions.inquiriesView)]
    [ProducesResponseType(typeof(ApiResponse<InquiriesSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInquiries(
        [FromQuery] string? type = null,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null)
    {
        var result = await mediator.Send(new GetInquiriesQuery(type, status, search));
        return result.Succeeded ? Ok(result) : StatusCode(StatusCodes.Status500InternalServerError, result);
    }

    /// <summary>
    /// Updates the qualification or review status of an inquiry or lead by reference code.
    /// </summary>
    [HttpPatch("{referenceCode}/status")]
    [Authorize]
    [HasPermission(PlatformPermissions.inquiriesManage)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateInquiryStatus(
        [FromRoute] string referenceCode,
        [FromBody] UpdateInquiryStatusCommand command)
    {
        if (string.IsNullOrWhiteSpace(referenceCode))
        {
            return BadRequest(ApiResponse<bool>.Fail("Reference code is required."));
        }

        command.ReferenceCode = referenceCode;
        var result = await mediator.Send(command);
        if (!result.Succeeded)
        {
            return result.Message?.Contains("not found", StringComparison.OrdinalIgnoreCase) == true
                ? NotFound(result)
                : BadRequest(result);
        }

        return Ok(result);
    }
}
