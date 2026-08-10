using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OfficeType.Commands.CreateOfficeType;

public class CreateOfficeTypeCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateOfficeTypeCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOfficeTypeCommand request, CancellationToken cancellationToken)
    {
        var duplicate = await unitOfWork.OfficeTypeRepository.FindAsync(
            x => x.Code == request.Code, 
            cancellationToken);
        
        if (duplicate != null) 
            throw new ConflictException("OfficeType with this code already exists.");

        var officeType = new Domain.Entities.Planning.OfficeType
        {
            Name = request.Name,
            Code = request.Code,
            CanHaveChildren = request.CanHaveChildren,
            IsActive = true
        };

        await unitOfWork.OfficeTypeRepository.AddAsync(officeType, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(officeType.Id, "OfficeType created successfully.");
    }
}
