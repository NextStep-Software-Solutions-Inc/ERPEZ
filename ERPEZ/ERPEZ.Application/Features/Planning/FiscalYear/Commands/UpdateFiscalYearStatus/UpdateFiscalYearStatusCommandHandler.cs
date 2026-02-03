using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYearStatus;

public class UpdateFiscalYearStatusCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateFiscalYearStatusCommand, ApiResponse<Unit>>
{
    private static readonly string[] validTransitions = ["setup", "planning", "active", "closed"];
    private static readonly Dictionary<string, string[]> allowedTransitions = new()
    {
        ["setup"] = ["planning"],
        ["planning"] = ["active", "setup"],
        ["active"] = ["closed"],
        ["closed"] = []
    };

    public async Task<ApiResponse<Unit>> Handle(UpdateFiscalYearStatusCommand request, CancellationToken cancellationToken)
    {
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) 
            ?? throw new NotFoundException("Fiscal year not found.");

        var newStatus = request.Status.ToLowerInvariant();
        
        if (!validTransitions.Contains(newStatus))
            throw new ConflictException($"Invalid status. Valid statuses are: {string.Join(", ", validTransitions)}");

        var currentStatus = fiscalYear.Status.ToLowerInvariant();
        
        if (!allowedTransitions[currentStatus].Contains(newStatus))
            throw new ConflictException($"Cannot transition from '{currentStatus}' to '{newStatus}'. Allowed transitions: {string.Join(", ", allowedTransitions[currentStatus])}");

        // When transitioning to active, ensure only ONE fiscal year is active
        if (newStatus == "active")
        {
            var activeFiscalYear = await unitOfWork.FiscalYearRepository.FindAsync(
                fy => fy.Status == "active" && fy.Id != request.Id,
                cancellationToken: cancellationToken);

            if (activeFiscalYear != null)
                throw new ConflictException($"Cannot activate fiscal year. Another fiscal year (Year {activeFiscalYear.Year}) is already active.");
        }

        fiscalYear.Status = newStatus;
        unitOfWork.FiscalYearRepository.Update(fiscalYear);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Fiscal year status updated to '{newStatus}' successfully.");
    }
}
