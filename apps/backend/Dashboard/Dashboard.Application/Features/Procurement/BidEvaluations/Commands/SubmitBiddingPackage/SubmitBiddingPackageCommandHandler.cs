using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using FluentValidation;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.SubmitBiddingPackage;

public class SubmitBiddingPackageCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<SubmitBiddingPackageCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(SubmitBiddingPackageCommand command, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository
            .GetByIdAsync(command.ProjectId, cancellationToken)
            ?? throw new NotFoundException("Procurement project not found.");

        var supplier = await unitOfWork.SupplierRepository
            .GetByIdAsync(command.Request.SupplierId, cancellationToken)
            ?? throw new NotFoundException("Supplier not found.");

        // Validate submission deadline using BiddingActivitySchedule.EndDate
        var submissionSchedule = project.BiddingActivitySchedules
            .FirstOrDefault(s => s.ProcurementActivityType?.SystemRole == ProcurementActivitySystemRole.SubmissionOpeningOfBids);

        if (submissionSchedule != null && DateTime.UtcNow > submissionSchedule.EndDate)
        {
            throw new ForbiddenException(
                $"The submission deadline was {submissionSchedule.EndDate:MMMM dd, yyyy 'at' hh:mm tt} UTC. Bid submissions are no longer accepted.");
        }

        // Duplicate submission guard per project + supplier
        var existingSubmissions = await unitOfWork.BiddingSubmissionRepository
            .FindAllAsync(s => s.ProcurementProjectId == command.ProjectId && s.SupplierId == command.Request.SupplierId && !s.IsDeleted, cancellationToken);

        if (existingSubmissions.Count > 0)
        {
            throw new FluentValidation.ValidationException("A bid submission already exists for this supplier in this procurement project.");
        }

        var actorName = currentUserService.Name ?? currentUserService.Username ?? "System";

        var submission = new BiddingSubmission
        {
            ProcurementProjectId = command.ProjectId,
            SupplierId = command.Request.SupplierId,
            PublicSupplierApplicationId = command.Request.PublicSupplierApplicationId,
            OriginalProposedAmount = command.Request.OriginalProposedAmount,
            BidSecurityType = command.Request.BidSecurityType,
            BidSecurityAmount = command.Request.BidSecurityAmount,
            BidSecurityNumber = command.Request.BidSecurityNumber,
            BidSecurityValidityDays = command.Request.BidSecurityValidityDays,
            SubmissionType = command.Request.SubmissionType,
            SubmittedAt = DateTime.UtcNow,
            Remarks = command.Request.Remarks,
            CreatedBy = actorName
        };

        await unitOfWork.BiddingSubmissionRepository.AddAsync(submission, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(submission.Id, "Bidding package submitted successfully.");
    }
}
