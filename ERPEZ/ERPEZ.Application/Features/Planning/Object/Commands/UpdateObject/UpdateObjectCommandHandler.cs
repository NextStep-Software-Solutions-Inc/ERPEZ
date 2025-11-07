using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Commands.UpdateObject;

public class UpdateObjectCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateObjectCommand, ApiResponse<ObjectDto>>
{
    public async Task<ApiResponse<ObjectDto>> Handle(UpdateObjectCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateObject;
        var reqObject = await _unitOfWork.ObjectRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Object not found.");

        var duplicate = await _unitOfWork.ObjectRepository.FindAsync( o => 
            o.Name == dto.Name &&
            o.Code == dto.Code,
            cancellationToken
        );

        if (duplicate != null && duplicate.Id != request.Id)
            throw new ConflictException("Object already exists.");

        reqObject.Code = dto.Code;
        reqObject.Name = dto.Name;
        reqObject.IsActive = dto.IsActive;

        _unitOfWork.ObjectRepository.Update(reqObject);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new ObjectDto
        {
            Id = reqObject.Id,
            ParentId = reqObject.ParentId,
            Name = reqObject.Name,
            Code = reqObject.Code,
            IsActive = dto.IsActive
        };
        return ApiResponse<ObjectDto>.Success(result, "Object updated successfully.");
    }
}
