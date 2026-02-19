using ERPEZ.Application.Features.Planning.AdministrativeLevel.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.AdministrativeLevel.Queries.GetAdministrativeLevelById;

public class GetAdministrativeLevelByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetAdministrativeLevelByIdQuery, ApiResponse<AdministrativeLevelResponse>>
{
    public async Task<ApiResponse<AdministrativeLevelResponse>> Handle(GetAdministrativeLevelByIdQuery request, CancellationToken cancellationToken)
    {
        var administrativeLevel = await unitOfWork.AdministrativeLevelRepository.FindAsync(
            t => t.Id == request.Id, 
            cancellationToken: cancellationToken) 
            ?? throw new NotFoundException("Administrative Level not found.");

        var result = new AdministrativeLevelResponse
        {
            Id = administrativeLevel.Id,
            Name = administrativeLevel.Name,
            Code = administrativeLevel.Code,
            CanHaveChildren = administrativeLevel.CanHaveChildren,
            IsActive = administrativeLevel.IsActive
        };

        return ApiResponse<AdministrativeLevelResponse>.Success(result, "Retrieved successfully.");
    }
}
