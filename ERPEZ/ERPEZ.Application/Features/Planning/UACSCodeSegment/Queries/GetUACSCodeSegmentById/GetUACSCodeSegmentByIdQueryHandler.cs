using ERPEZ.Application.Features.Planning.UACSCodeSegment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegment.Queries.GetUACSCodeSegmentById;

public class GetUACSCodeSegmentByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetUACSCodeSegmentByIdQuery, ApiResponse<UACSCodeSegmentResponse>>
{
    public async Task<ApiResponse<UACSCodeSegmentResponse>> Handle(GetUACSCodeSegmentByIdQuery request, CancellationToken cancellationToken)
    {
        var query = unitOfWork.UACSCodeSegmentRepository.Query(c => c.Id == request.Id)
            .Select(codeSegment => new UACSCodeSegmentResponse
            {
                Id = codeSegment.Id,
                SegmentType = codeSegment.SegmentType,
                Name = codeSegment.Name,
                Description = codeSegment.Description,
                DisplayOrder = codeSegment.DisplayOrder,
                IsRequired = codeSegment.IsRequired,
                MaxLength = codeSegment.MaxLength,
                Pattern = codeSegment.Pattern,
                IsActive = codeSegment.IsActive,
                CreatedBy = codeSegment.CreatedBy,
                CreatedAt = codeSegment.CreatedAt
            });

        var result = await unitOfWork.UACSCodeSegmentRepository.GetFirstAsync(query, cancellationToken) 
            ?? throw new NotFoundException("UACS code segment not found.");

        return ApiResponse<UACSCodeSegmentResponse>.Success(result, "Retrieved successfully");
    }
}
