using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Commands.ChangeAPPStatus;

public class ChangeAPPStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ChangeAPPStatusCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        ChangeAPPStatusCommand request, CancellationToken cancellationToken)
    {
        var app = await unitOfWork.APPRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        var (isValid, errorMessage) = ValidateTransition(app.Status, request.Status);
        if (!isValid)
            return ApiResponse<Guid>.Fail(errorMessage);

        app.Status = request.Status;

        if (request.Remarks != null)
            app.Remarks = request.Remarks;

        switch (request.Status)
        {
            case StatusEnum.Submitted:
                app.SubmittedDate = DateTime.UtcNow;
                app.ApprovedDate  = null;
                break;

            case StatusEnum.Approved:
                app.ApprovedDate = DateTime.UtcNow;
                // Synchronize IsFinal: only a Final APP becomes IsFinal=true when approved.
                // Indicative and Updated APPs remain IsFinal=false regardless of approval state.
                app.IsFinal = string.Equals(app.APPType, "Final", StringComparison.OrdinalIgnoreCase)
                    ? "true"
                    : "false";
                break;

            case StatusEnum.Returned:
            case StatusEnum.Draft:
                app.SubmittedDate = null;
                app.ApprovedDate  = null;
                // Clear IsFinal if the APP is reverted from Approved state.
                app.IsFinal = "false";
                break;
        }

        unitOfWork.APPRepository.Update(app);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(
            app.Id, $"APP status changed to {request.Status} successfully.");
    }

    private static (bool isValid, string errorMessage) ValidateTransition(
        StatusEnum current, StatusEnum next)
    {
        var allowed = new Dictionary<StatusEnum, List<StatusEnum>>
        {
            { StatusEnum.Draft,     [StatusEnum.Submitted] },
            { StatusEnum.Submitted, [StatusEnum.Approved, StatusEnum.Returned] },
            { StatusEnum.Returned,  [StatusEnum.Submitted] },
            { StatusEnum.Approved,  [] },  // terminal — no further transitions
        };

        if (!allowed.TryGetValue(current, out var validNext) || !validNext.Contains(next))
            return (false, $"Cannot transition APP status from '{current}' to '{next}'.");

        return (true, string.Empty);
    }
}