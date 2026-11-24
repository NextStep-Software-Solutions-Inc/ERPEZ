using ERPEZ.Shared.Common;
using MediatR;
using System;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.ReturnProcurementProject;

public record ReturnProcurementProjectCommand : IRequest<ApiResponse<Unit>>
{
    public Guid ProjectId { get; init; }
    public ReturnProcurementProjectRequest Request { get; init; } = null!;
}

public record ReturnProcurementProjectRequest
{
    public string Remarks { get; init; } = string.Empty;
    public string? Reason { get; init; }
}
