// GetPublicApplicationStatusQuery.cs
using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicApplicationStatus;

public record GetPublicApplicationStatusQuery(Guid Id) : IRequest<ApiResponse<PublicApplicationStatusDto>>;