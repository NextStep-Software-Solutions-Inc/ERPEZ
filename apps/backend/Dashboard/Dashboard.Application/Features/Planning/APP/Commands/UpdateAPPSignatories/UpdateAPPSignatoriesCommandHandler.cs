using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Commands.UpdateAPPSignatories;

public class UpdateAPPSignatoriesCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateAPPSignatoriesCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateAPPSignatoriesCommand request, CancellationToken cancellationToken)
    {
        var app = await unitOfWork.APPRepository.GetAPPWithDetailsAsync(request.APPId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        // Load and remove existing signatory assignments for this APP version, including soft-deleted ones
        var existingSignatoriesQuery = unitOfWork.APPSignatoryRepository.Query(s => s.APPId == request.APPId, ignoreQueryFilters: true);
        var existingSignatories = await unitOfWork.APPSignatoryRepository.ToListAsync(existingSignatoriesQuery, cancellationToken);
        
        if (existingSignatories.Any())
        {
            foreach (var s in existingSignatories)
            {
                s.AllowHardDelete = true;
            }
            unitOfWork.APPSignatoryRepository.RemoveRange(existingSignatories);
        }

        // Add new APP-specific signatory assignments
        var req = request.Request;
        int order = 0;
        var newSignatories = new List<APPSignatory>();

        void AddRoleSignatories(List<Dtos.APPSignatoryItemRequest> items, string roleKey)
        {
            foreach (var item in items)
            {
                if (string.IsNullOrWhiteSpace(item.Name) && item.UserId == null) continue;

                newSignatories.Add(new APPSignatory
                {
                    Id = Guid.NewGuid(),
                    APPId = app.Id,
                    UserId = item.UserId,
                    PersonnelPositionId = item.PersonnelPositionId,
                    RoleKey = roleKey,
                    Name = item.Name?.Trim() ?? string.Empty,
                    Position = item.Position?.Trim() ?? string.Empty,
                    Department = item.Department?.Trim() ?? string.Empty,
                    SignatureDate = item.SignatureDate,
                    SequenceOrder = ++order
                });
            }
        }

        AddRoleSignatories(req.PreparedBy, "preparedBy");
        AddRoleSignatories(req.ReviewedBy, "reviewedBy");
        AddRoleSignatories(req.ApprovedBy, "approvedBy");
        AddRoleSignatories(req.CertifiedBy, "certifiedBy");

        if (newSignatories.Any())
        {
            await unitOfWork.APPSignatoryRepository.AddRangeAsync(newSignatories, cancellationToken);
        }

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException ex)
        {
            var details = string.Join("; ", ex.Entries.Select(e => $"Entity: {e.Entity.GetType().Name}, State: {e.State}, ID: {(e.Entity as ERPEZ.Domain.Common.BaseEntity)?.Id}"));
            throw new System.InvalidOperationException($"Save failed during signatories update (Concurrency): {ex.Message}. Tracked entries: {details}", ex);
        }
        catch (System.Exception ex)
        {
            var innerMessage = ex.InnerException?.Message ?? ex.Message;
            throw new System.InvalidOperationException($"Save failed during signatories update: {innerMessage}. Stack: {ex.StackTrace}", ex);
        }

        return ApiResponse<Unit>.Success(Unit.Value, "APP Signatories updated successfully.");
    }
}
