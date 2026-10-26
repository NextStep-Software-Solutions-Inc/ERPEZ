using System.Collections.Generic;
using ERPEZ.Application.Features.Procurement.Dashboard.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetProcurementAuditTrail;

public record GetProcurementAuditTrailQuery(int Limit = 20)
    : IRequest<ApiResponse<List<ProcurementAuditLogItemDto>>>;
