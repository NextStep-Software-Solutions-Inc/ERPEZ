using ERPEZ.Application.Features.Planning.UACSImport.Commands.ImportUACSData;
using ERPEZ.Application.Features.Planning.UACSImport.Dtos;
using ERPEZ.Api.Models;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Controller for UACS import operations.
/// </summary>
[Route("uacs")]
[ApiController]
public class UACSImportController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Imports UACS data from a CSV file.
    /// </summary>
    /// <param name="model">Form data containing the file and import parameters.</param>
    /// <returns>Detailed import results with summary and errors.</returns>
    [HttpPost("import-csv")]
    [ProducesResponseType(typeof(ApiResponse<UACSImportResultResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UACSImportResultResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ImportCsv([FromForm] UACSImportFormModel model)
    {
        var command = new ImportUACSDataCommand
        {
            File = model.File,
            SegmentType = model.SegmentType,
            IsDryRun = model.IsDryRun,
            ImportedBy = model.ImportedBy
        };

        var response = await mediator.Send(command);

        return response.Succeeded ? Ok(response) : BadRequest(response);
    }
}
