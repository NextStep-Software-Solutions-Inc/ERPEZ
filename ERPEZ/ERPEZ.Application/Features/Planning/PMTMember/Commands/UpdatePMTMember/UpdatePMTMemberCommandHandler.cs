using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PMTMember.Commands.UpdatePMTMember;

public class UpdatePMTMemberCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdatePMTMemberCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdatePMTMemberCommand request, CancellationToken cancellationToken)
    {
        var pmtMember = await unitOfWork.PMTMemberRepository.GetByIdAsync(
            request.Id,
            cancellationToken
        );

        if (pmtMember == null)
            throw new NotFoundException($"PMT Member with ID '{request.Id}' not found.");

        // Validate PMT if provided
        if (request.UpdatePMTMember.PMTId.HasValue)
        {
            var pmt = await unitOfWork.PMTRepository.GetByIdAsync(
                request.UpdatePMTMember.PMTId.Value,
                cancellationToken
            );

            if (pmt == null)
                throw new NotFoundException($"PMT with ID '{request.UpdatePMTMember.PMTId}' not found.");

            // Check if new PMT+User combination exists (excluding current record)
            if (request.UpdatePMTMember.PMTId.Value != pmtMember.PMTId)
            {
                var targetUserId = request.UpdatePMTMember.UserId ?? pmtMember.UserId;
                var isUserInPMT = await unitOfWork.PMTMemberRepository.IsUserInPMTAsync(
                    request.UpdatePMTMember.PMTId.Value,
                    targetUserId,
                    cancellationToken
                );

                if (isUserInPMT)
                    throw new ConflictException($"User is already a member of this PMT.");
            }

            pmtMember.PMTId = request.UpdatePMTMember.PMTId.Value;
        }

        // Validate UserId if provided and PMT is unchanged or not provided
        if (request.UpdatePMTMember.UserId.HasValue && request.UpdatePMTMember.UserId.Value != pmtMember.UserId)
        {
            // Validate User exists
            var user = await unitOfWork.UserRepository.GetByIdAsync(
                request.UpdatePMTMember.UserId.Value,
                cancellationToken
            );

            if (user == null)
                throw new NotFoundException($"User with ID '{request.UpdatePMTMember.UserId}' not found.");

            var isUserInPMT = await unitOfWork.PMTMemberRepository.IsUserInPMTAsync(
                pmtMember.PMTId,
                request.UpdatePMTMember.UserId.Value,
                cancellationToken
            );

            if (isUserInPMT)
                throw new ConflictException($"User is already a member of this PMT.");

            pmtMember.UserId = request.UpdatePMTMember.UserId.Value;
        }

        // Update fields
        if (!string.IsNullOrEmpty(request.UpdatePMTMember.Role))
            pmtMember.Role = request.UpdatePMTMember.Role;

        if (request.UpdatePMTMember.AppointmentDate.HasValue)
            pmtMember.AppointmentDate = request.UpdatePMTMember.AppointmentDate.Value;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
