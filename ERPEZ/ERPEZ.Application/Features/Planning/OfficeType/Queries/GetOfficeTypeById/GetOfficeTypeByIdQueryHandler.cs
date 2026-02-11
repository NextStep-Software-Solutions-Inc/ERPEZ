using ERPEZ.Application.Features.Planning.OfficeType.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OfficeType.Queries.GetOfficeTypeById;

public class GetOfficeTypeByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetOfficeTypeByIdQuery, ApiResponse<OfficeTypeResponse>>
{
    public async Task<ApiResponse<OfficeTypeResponse>> Handle(GetOfficeTypeByIdQuery request, CancellationToken cancellationToken)
    {
        var officeType = await unitOfWork.OfficeTypeRepository.FindAsync(
            t => t.Id == request.Id, 
            cancellationToken: cancellationToken) 
            ?? throw new NotFoundException("OfficeType not found.");

        var result = new OfficeTypeResponse
        {
            Id = officeType.Id,
            Name = officeType.Name,
            Code = officeType.Code,
            CanHaveChildren = officeType.CanHaveChildren,
            IsActive = officeType.IsActive,
            CreatedAt = officeType.CreatedAt,
            CreatedBy = officeType.CreatedBy
        };

        return ApiResponse<OfficeTypeResponse>.Success(result, "Retrieved successfully.");
    }
}
