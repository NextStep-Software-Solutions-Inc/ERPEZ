using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Queries.GetModuleById;

public sealed class GetModuleByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetModuleByIdQuery, Module?>
{
    public async Task<Module?> Handle(
        GetModuleByIdQuery request,
        CancellationToken cancellationToken)
    {
        var module = await unitOfWork.ModuleRepository.FindAsync(
           t => t.Id == request.Id && !t.IsDeleted,
            cancellationToken: cancellationToken);
        return module;
    }
}
