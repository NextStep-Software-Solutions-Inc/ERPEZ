using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Commands.CreateObject;

public class CreateObjectCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateObjectCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateObjectCommand request, CancellationToken cancellationToken)
    {
        if (request.ParentId != null)
        {
            _ = await unitOfWork.ObjectRepository.FindAsync(wo => wo.Id == request.ParentId,
                cancellationToken) ?? throw new NotFoundException("Parent Object not found.");
        }

        if (request.FiscalYearId.HasValue)
        {
            _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId.Value, cancellationToken) ?? throw new NotFoundException($"Fiscal Year with the specified ID ({request.FiscalYearId.Value}) does not exist.");
        }

        var duplicate = await unitOfWork.ObjectRepository.FindAsync(o => o.ParentId == request.ParentId &&
        o.Name == request.Name &&
        o.Code == request.Code &&
        o.FiscalYearId == request.FiscalYearId, cancellationToken);
        if (duplicate != null) throw new ConflictException("Object already exist.");

        var requestObject = new Domain.Entities.Planning.Object
        {
            ParentId = request.ParentId,
            Name = request.Name,
            Code = request.Code,
            IsActive = request.IsActive,
            FiscalYearId = request.FiscalYearId
        };

        await unitOfWork.ObjectRepository.AddAsync(requestObject, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(requestObject.Id, "Object created successfully.");
    }
}
