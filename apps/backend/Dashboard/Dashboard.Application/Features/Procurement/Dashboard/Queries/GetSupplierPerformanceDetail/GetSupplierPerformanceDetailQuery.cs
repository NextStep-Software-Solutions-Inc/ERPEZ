using System;
using ERPEZ.Application.Features.Procurement.Dashboard.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetSupplierPerformanceDetail;

public record GetSupplierPerformanceDetailQuery(Guid SupplierId)
    : IRequest<ApiResponse<SupplierPerformanceDetailDto>>;
