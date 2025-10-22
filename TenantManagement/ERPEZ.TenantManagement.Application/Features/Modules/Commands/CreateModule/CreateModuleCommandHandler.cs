using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Commands.CreateModule;

public class CreateModuleCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateModuleCommand, ApiResponse<Guid>>
{

    public async Task<ApiResponse<Guid>> Handle(CreateModuleCommand request, CancellationToken cancellationToken)
    {
        var moduleExist = await _unitOfWork.ModuleRepository.FindAsync(t => t.Name == request.Name, cancellationToken);
        if (moduleExist != null) throw new ConflictException("Module already exists.");
        var module = new Module
        {
            Name = request.Name,
            Key = request.Key,
            Description = request.Description,
            IsActive = request.IsActive

        };

        await _unitOfWork.ModuleRepository.AddAsync(module, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return new()
        {
            Data =  module.Id,
            Succeeded = true,
            Message = "Module created successfully."
        };
    }

}
