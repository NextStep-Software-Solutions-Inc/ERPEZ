using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProjectStatus;

public record UpdateProcurementProjectStatusCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required UpdateProcurementProjectStatusRequest StatusRequest { get; init; }
}
