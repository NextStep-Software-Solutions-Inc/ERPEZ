using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Commands.CreateObject;

public class CreateObjectCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateObjectCommand, ApiResponse<ObjectResponse>>
{
    public async Task<ApiResponse<ObjectResponse>> Handle(CreateObjectCommand request, CancellationToken cancellationToken)
    {
        if (request.ParentId != null)
        {
            _ = await unitOfWork.ObjectRepository.FindAsync(wo => wo.Id == request.ParentId,
                cancellationToken) ?? throw new NotFoundException("Parent Object not found.");
        }

        var duplicate = await unitOfWork.ObjectRepository.FindAsync(o => o.ParentId == request.ParentId &&
        o.Name == request.Name &&
        o.Code == request.Code, cancellationToken);
        if (duplicate != null) throw new ConflictException("Object already exist.");

        var requestObject = new Domain.Entities.Planning.Object
        {
            ParentId = request.ParentId,
            Name = request.Name,
            Code = request.Code,
            IsActive = request.IsActive
        };

        await unitOfWork.ObjectRepository.AddAsync(requestObject, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new ObjectResponse
        {
            Id = requestObject.Id,
            ParentId = requestObject.ParentId,
            Name = requestObject.Name,
            Code = requestObject.Code,
            IsActive = requestObject.IsActive
        };
        return ApiResponse<ObjectResponse>.Success(dto, "Object created successfully.");
    }
}
