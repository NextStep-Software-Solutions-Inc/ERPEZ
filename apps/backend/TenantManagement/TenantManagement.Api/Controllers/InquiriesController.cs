using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.RequestQuote;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.ScheduleDemo;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.SubscribeNewsletter;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.TenantManagement.Api.Controllers;

[ApiController]
[Route("inquiries")]
[AllowAnonymous]
public class InquiriesController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Processes public quote requests for tailored scope, user limits, and deployment architectures.
    /// </summary>
    [HttpPost("quote")]
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
    [ProducesResponseType(typeof(ApiResponse<DemoResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<DemoResponseDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ScheduleDemo([FromBody] ScheduleDemoCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
