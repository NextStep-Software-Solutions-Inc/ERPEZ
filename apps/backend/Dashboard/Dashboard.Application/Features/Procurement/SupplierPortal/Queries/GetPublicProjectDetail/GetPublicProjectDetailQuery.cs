using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjectDetail;

public record GetPublicProjectDetailQuery(Guid Id) : IRequest<ApiResponse<PublicProjectDetailDto>>;