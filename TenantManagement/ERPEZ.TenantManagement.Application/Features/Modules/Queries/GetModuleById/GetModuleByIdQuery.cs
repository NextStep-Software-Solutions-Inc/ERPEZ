using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Queries.GetModuleById;

public record GetModuleByIdQuery(Guid Id) : IRequest<ApiResponse<Module>>;