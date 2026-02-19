using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PMTMember.Commands.CreatePMTMember;

public class CreatePMTMemberCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreatePMTMemberCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreatePMTMemberCommand request, CancellationToken cancellationToken)
    {
        // Validate PMT exists
        var pmt = await unitOfWork.PMTRepository.GetByIdAsync(
            request.PMTId,
            cancellationToken
        );

        if (pmt == null)
            throw new NotFoundException($"PMT with ID '{request.PMTId}' not found.");

        // Check if user is already a member of this PMT
        var isUserInPMT = await unitOfWork.PMTMemberRepository.IsUserInPMTAsync(
            request.PMTId,
            request.UserId,
            cancellationToken
        );

        if (isUserInPMT)
            throw new ConflictException($"User is already a member of this PMT.");

        // Create entity
        var pmtMember = new Domain.Entities.Planning.PMTMember
        {
            Id = Guid.NewGuid(),
            PMTId = request.PMTId,
            UserId = request.UserId,
            Role = request.Role,
            AppointmentDate = request.AppointmentDate
        };

        await unitOfWork.PMTMemberRepository.AddAsync(pmtMember, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(pmtMember.Id);
    }
}
