using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Billing.Commands.CreateTenantPaymentMethod;
using ERPEZ.TenantManagement.Application.Features.Billing.Commands.DeleteTenantPaymentMethod;
using ERPEZ.TenantManagement.Application.Features.Billing.Commands.ProcessTenantInvoicePayment;
using ERPEZ.TenantManagement.Application.Features.Billing.Commands.SetDefaultPaymentMethod;
using ERPEZ.TenantManagement.Application.Features.Billing.Commands.UpdateTenantBillingContact;
using ERPEZ.TenantManagement.Application.Features.Billing.Dtos;
using ERPEZ.TenantManagement.Application.Features.Billing.Queries.GetTenantBillingContact;
using ERPEZ.TenantManagement.Application.Features.Billing.Queries.GetTenantInvoiceById;
using ERPEZ.TenantManagement.Application.Features.Billing.Queries.GetTenantInvoices;
using ERPEZ.TenantManagement.Application.Features.Billing.Queries.GetTenantPaymentMethods;
using ERPEZ.TenantManagement.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.TenantManagement.Api.Controllers;

[ApiController]
[Route("billing")]
[Authorize]
public class BillingController(ISender mediator) : ControllerBase
{
    // ==========================================
    // Invoices Endpoints
    // ==========================================

    [HttpGet("invoices")]
    [HasPermission(TenantPermissions.invoicesView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<TenantInvoiceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInvoices([FromQuery] GetTenantInvoicesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("invoices/{id}")]
    [HasPermission(TenantPermissions.invoicesView)]
    [ProducesResponseType(typeof(ApiResponse<TenantInvoiceDto?>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInvoiceById(Guid id)
    {
        var result = await mediator.Send(new GetTenantInvoiceByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost("invoices/{id}/pay")]
    [HasPermission(TenantPermissions.billingManage)]
    [ProducesResponseType(typeof(ApiResponse<TenantInvoiceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PayInvoice(Guid id, [FromBody] ProcessInvoicePaymentDto dto)
    {
        var command = new ProcessTenantInvoicePaymentCommand(id, dto.PaymentMethodId);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    // ==========================================
    // Payment Methods Endpoints
    // ==========================================

    [HttpGet("payment-methods")]
    [HasPermission(TenantPermissions.billingView)]
    [ProducesResponseType(typeof(ApiResponse<List<TenantPaymentMethodDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPaymentMethods([FromQuery] Guid? tenantId)
    {
        var result = await mediator.Send(new GetTenantPaymentMethodsQuery(tenantId));
        return Ok(result);
    }

    [HttpPost("payment-methods")]
    [HasPermission(TenantPermissions.billingManage)]
    [ProducesResponseType(typeof(ApiResponse<TenantPaymentMethodDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddPaymentMethod([FromBody] CreateTenantPaymentMethodCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPut("payment-methods/{id}/default")]
    [HasPermission(TenantPermissions.billingManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SetDefaultPaymentMethod(Guid id)
    {
        var result = await mediator.Send(new SetDefaultPaymentMethodCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("payment-methods/{id}")]
    [HasPermission(TenantPermissions.billingManage)]
    [ProducesResponseType(typeof(ApiResponse<DeletePaymentMethodResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeletePaymentMethod(Guid id)
    {
        var result = await mediator.Send(new DeleteTenantPaymentMethodCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    // ==========================================
    // Billing Contact Endpoints
    // ==========================================

    [HttpGet("contact")]
    [HasPermission(TenantPermissions.billingView)]
    [ProducesResponseType(typeof(ApiResponse<TenantBillingContactDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBillingContact([FromQuery] Guid? tenantId)
    {
        var result = await mediator.Send(new GetTenantBillingContactQuery(tenantId));
        return Ok(result);
    }

    [HttpPut("contact")]
    [HasPermission(TenantPermissions.billingManage)]
    [ProducesResponseType(typeof(ApiResponse<TenantBillingContactDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateBillingContact([FromBody] UpdateTenantBillingContactCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
