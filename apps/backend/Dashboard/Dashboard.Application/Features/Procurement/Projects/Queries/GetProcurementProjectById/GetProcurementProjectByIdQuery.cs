using System;
using ERPEZ.Application.Features.Procurement.Projects.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Queries.GetProcurementProjectById;

public record GetProcurementProjectByIdQuery(Guid Id) : IRequest<ApiResponse<ProcurementProjectResponse>>;
