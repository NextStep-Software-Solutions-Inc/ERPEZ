using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.DeleteProcurementProject;

public record DeleteProcurementProjectCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
