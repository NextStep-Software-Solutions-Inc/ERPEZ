using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Commands.DeleteModule;

public sealed class DeleteModuleCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteModuleCommand,ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteModuleCommand request, CancellationToken cancellationToken)
    {
        var module = await unitOfWork.ModuleRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

        if (module == null) return ApiResponse<Unit>.Fail("Module not found.");

        unitOfWork.ModuleRepository.Remove(module);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Module with ID {request.Id} deleted successfully.");
    }
}
