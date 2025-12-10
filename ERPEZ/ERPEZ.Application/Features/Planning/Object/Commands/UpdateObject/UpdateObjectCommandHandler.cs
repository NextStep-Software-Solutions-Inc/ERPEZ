using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Commands.UpdateObject;

public class UpdateObjectCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateObjectCommand, ApiResponse<ObjectResponse>>
{
    public async Task<ApiResponse<ObjectResponse>> Handle(UpdateObjectCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateObject;
        var reqObject = await unitOfWork.ObjectRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Object not found.");

        var newName = dto.Name ?? reqObject.Name;
        var newCode = dto.Code ?? reqObject.Code;

        var duplicate = await unitOfWork.ObjectRepository.FindAsync(o =>
            o.Id != request.Id &&
            o.Name == newName &&
            o.Code == newCode,
            cancellationToken
        );

        if (duplicate != null)
            throw new ConflictException("Object already exists.");

        reqObject.Code = newCode;
        reqObject.Name = newName;
        reqObject.IsActive = dto.IsActive ?? reqObject.IsActive;

        unitOfWork.ObjectRepository.Update(reqObject);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new ObjectResponse
        {
            Id = reqObject.Id,
            ParentId = reqObject.ParentId,
            Name = reqObject.Name,
            Code = reqObject.Code,
            IsActive = reqObject.IsActive
        };
        return ApiResponse<ObjectResponse>.Success(result, "Object updated successfully.");
    }
}
