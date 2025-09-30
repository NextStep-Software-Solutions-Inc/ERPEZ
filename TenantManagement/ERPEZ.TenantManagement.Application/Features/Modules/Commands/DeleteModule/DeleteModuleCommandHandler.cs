using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Commands.DeleteModule;

public sealed class DeleteModuleCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteModuleCommand,ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteModuleCommand request, CancellationToken cancellationToken)
    {
        var module = await unitOfWork.ModuleRepository.FindAsync(t => t.Id == request.Id && !t.IsDeleted, cancellationToken: cancellationToken);

        if (module == null)
        {
            return new ApiResponse<Unit>()
            {
                Succeeded = false,
                Message = "Module not found."
            };
        }

        module.MarkAsDeleted(request.Id);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Module with ID {request.Id} deleted successfully.");
    }
}
