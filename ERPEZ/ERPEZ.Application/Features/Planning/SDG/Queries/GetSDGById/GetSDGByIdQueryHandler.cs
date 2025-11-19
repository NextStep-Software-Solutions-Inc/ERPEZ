using ERPEZ.Application.Features.Planning.SDG.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SDG.Queries.GetSDGById;

public class GetSDGByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetSDGByIdQuery, ApiResponse<SDGResponse>>
{
    public async Task<ApiResponse<SDGResponse>> Handle(GetSDGByIdQuery request, CancellationToken cancellationToken)
    {
        var sdg = await unitOfWork.SDGRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"SDG with ID {request.Id} not found.");

        var response = new SDGResponse
        {
            Id = sdg.Id,
            Name = sdg.Name,
            Description = sdg.Description
        };

        return ApiResponse<SDGResponse>.Success(response);
    }
}
