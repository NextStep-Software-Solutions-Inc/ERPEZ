using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Queries.GetOfficeByIdQuery;

public class GetOfficeByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOfficeByIdQuery, ApiResponse<OfficeResponse>>
{
    public async Task<ApiResponse<OfficeResponse>> Handle(GetOfficeByIdQuery request, CancellationToken cancellationToken)
    {
        var office = await unitOfWork.OfficeRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var result = new OfficeResponse()
        {
            Id = office.Id,
            ClusterId = office.ClusterId,
            OfficeHead = office.OfficeHead,
            Name = office.Name,
            Description = office.Description,
            Address = office.Address,
            Email = office.Email,
            ContactNumber = office.ContactNumber,
            ResponsibilityCenterCode = office.ResponsibilityCenterCode,
            CreatedBy = office.CreatedBy,
            CreatedAt = office.CreatedAt,
            IsDeliveryUnit = office.DeliveryUnits.Any(du => du.OfficeId == office.Id)
        };

        return ApiResponse<OfficeResponse>.Success(result, "Retrieved successfully");
    }
}
