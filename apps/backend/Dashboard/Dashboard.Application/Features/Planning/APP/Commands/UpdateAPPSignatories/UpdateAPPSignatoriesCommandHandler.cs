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

        // Remove existing signatory assignments for this APP version
        var existingSignatories = app.APPSignatories.Where(s => !s.IsDeleted).ToList();
        foreach (var sig in existingSignatories)
        {
            unitOfWork.APPSignatoryRepository.Remove(sig);
        }

        // Add new APP-specific signatory assignments
        var req = request.Request;
        int order = 0;

        void AddRoleSignatories(List<Dtos.APPSignatoryItemRequest> items, string roleKey)
        {
            foreach (var item in items)
            {
                if (string.IsNullOrWhiteSpace(item.Name) && item.UserId == null) continue;

                app.APPSignatories.Add(new APPSignatory
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

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "APP Signatories updated successfully.");
    }
}
