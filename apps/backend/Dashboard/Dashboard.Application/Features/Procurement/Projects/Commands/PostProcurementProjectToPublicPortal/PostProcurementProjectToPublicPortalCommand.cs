using ERPEZ.Shared.Common;
using MediatR;
using System;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.PostProcurementProjectToPublicPortal;

public record PostProcurementProjectToPublicPortalCommand(Guid ProjectId)
    : IRequest<ApiResponse<Unit>>;
