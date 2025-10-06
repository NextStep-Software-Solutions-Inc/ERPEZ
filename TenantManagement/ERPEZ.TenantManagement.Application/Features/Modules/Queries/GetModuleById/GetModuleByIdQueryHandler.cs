using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Queries.GetModuleById;

public sealed class GetModuleByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetModuleByIdQuery, ApiResponse<Module>>
{
    public async Task<ApiResponse<Module>> Handle(
        GetModuleByIdQuery request,
        CancellationToken cancellationToken)
    {
        var module = await unitOfWork.ModuleRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Module>.Success(module, "Retrieved successfully");
    }
}
