using ERPEZ.Shared.Common;
using MediatR;
using System;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.ApproveProcurementProject;

public record ApproveProcurementProjectCommand : IRequest<ApiResponse<Unit>>
{
    public Guid ProjectId { get; init; }
    public ApproveProcurementProjectRequest Request { get; init; } = null!;
}

public record ApproveProcurementProjectRequest
{
    public Guid AttachmentFileId { get; init; }
}
