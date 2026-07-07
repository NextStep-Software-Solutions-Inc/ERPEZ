using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjectStats;

public record GetPublicProjectStatsQuery : IRequest<ApiResponse<PublicProjectStatsDto>>;