using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProject;

public record UpdateProcurementProjectCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required UpdateProcurementProjectRequest UpdateRequest { get; init; }
}
