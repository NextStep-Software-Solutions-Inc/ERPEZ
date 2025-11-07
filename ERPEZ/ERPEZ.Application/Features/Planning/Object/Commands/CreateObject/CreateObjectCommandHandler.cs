using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Commands.CreateObject;

public class CreateObjectCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateObjectCommand, ApiResponse<ObjectDto>>
{
    public async Task<ApiResponse<ObjectDto>> Handle(CreateObjectCommand request, CancellationToken cancellationToken)
    {
        if (request.ParentId != null)
        {
            _ = await _unitOfWork.ObjectRepository.FindAsync(wo => wo.Id == request.ParentId,
                cancellationToken) ?? throw new NotFoundException("Parent Object should exist.");
        }

        var duplicate = await _unitOfWork.ObjectRepository.FindAsync(o => o.ParentId == request.ParentId &&
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

        await _unitOfWork.ObjectRepository.AddAsync(requestObject, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new ObjectDto
        {
            Id = requestObject.Id,
            ParentId = requestObject.ParentId,
            Name = requestObject.Name,
            Code = requestObject.Code,
            IsActive = request.IsActive
        };
        return ApiResponse<ObjectDto>.Success(dto, "Object created successfully.");
    }
}