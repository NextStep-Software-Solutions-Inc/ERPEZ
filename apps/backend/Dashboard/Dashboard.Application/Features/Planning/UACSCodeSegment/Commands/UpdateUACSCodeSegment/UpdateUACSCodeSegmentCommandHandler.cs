using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegment.Commands.UpdateUACSCodeSegment;

public class UpdateUACSCodeSegmentCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdateUACSCodeSegmentCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateUACSCodeSegmentCommand request, CancellationToken cancellationToken)
    {
        var codeSegment = await unitOfWork.UACSCodeSegmentRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("UACS code segment not found.");

        codeSegment.SegmentType = request.UpdateUACSCodeSegment.SegmentType;
        codeSegment.Name = request.UpdateUACSCodeSegment.Name;
        codeSegment.Description = request.UpdateUACSCodeSegment.Description;
        codeSegment.DisplayOrder = request.UpdateUACSCodeSegment.DisplayOrder;
        codeSegment.IsRequired = request.UpdateUACSCodeSegment.IsRequired;
        codeSegment.MaxLength = request.UpdateUACSCodeSegment.MaxLength;
        codeSegment.Pattern = request.UpdateUACSCodeSegment.Pattern;
        codeSegment.IsActive = request.UpdateUACSCodeSegment.IsActive;

        unitOfWork.UACSCodeSegmentRepository.Update(codeSegment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "UACS code segment updated successfully.");
    }
}
