using ERPEZ.Application.Features.Planning.UACSImport.Commands.ImportUACSData;
using ERPEZ.Application.Features.Planning.UACSImport.Dtos;
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
    /// <param name="file">The CSV file to import.</param>
    /// <param name="segmentType">The type of UACS segment (FundSource=1, Organization=2, Location=3, MFOPAP=4, Object=5).</param>
    /// <param name="isDryRun">If true, validates only without importing data.</param>
    /// <param name="importedBy">The username of the user performing the import.</param>
    /// <returns>Detailed import results with summary and errors.</returns>
    [HttpPost("import-csv")]
    [ProducesResponseType(typeof(ApiResponse<UACSImportResultResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UACSImportResultResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ImportCsv(
        [FromForm] IFormFile file,
        [FromForm] UACSSegmentTypeEnum segmentType,
        [FromForm] bool isDryRun,
        [FromForm] string importedBy)
    {
        var command = new ImportUACSDataCommand
        {
            File = file,
            SegmentType = segmentType,
            IsDryRun = isDryRun,
            ImportedBy = importedBy
        };

        var response = await mediator.Send(command);

        return response.Succeeded ? Ok(response) : BadRequest(response);
    }
}
