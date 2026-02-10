using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace ERPEZ.Application.Features.Planning.Position.Commands.UploadPositionPSI;

public class UploadPositionPSICommand : IRequest<ApiResponse<PositionImportResult>>
{
    public required IFormFile File { get; init; }
}
