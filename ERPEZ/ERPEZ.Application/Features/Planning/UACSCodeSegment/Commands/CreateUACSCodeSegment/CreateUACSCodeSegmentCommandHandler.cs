using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegment.Commands.CreateUACSCodeSegment;

public class CreateUACSCodeSegmentCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateUACSCodeSegmentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateUACSCodeSegmentCommand request, CancellationToken cancellationToken)
    {
        // Check if code segment with same type already exists
        var existing = await unitOfWork.UACSCodeSegmentRepository.FindAsync(
            c => c.SegmentType == request.SegmentType, cancellationToken);
        
        if (existing != null)
        {
            throw new ConflictException($"UACS code segment for {request.SegmentType} already exists.");
        }

        var codeSegment = new Domain.Entities.Planning.UACSCodeSegment
        {
            SegmentType = request.SegmentType,
            Name = request.Name,
            Description = request.Description,
            DisplayOrder = request.DisplayOrder,
            IsRequired = request.IsRequired,
            MaxLength = request.MaxLength,
            Pattern = request.Pattern,
            IsActive = request.IsActive
        };

        await unitOfWork.UACSCodeSegmentRepository.AddAsync(codeSegment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(codeSegment.Id, "UACS code segment created successfully.");
    }
}
