using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;

namespace ERPEZ.Application.Common.Helpers;

public static class PhilippineCurrencyWordsHelper
{
    private static readonly string[] ones =
    [
        "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
        "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN",
        "SEVENTEEN", "EIGHTEEN", "NINETEEN"
    ];

    private static readonly string[] tens =
    [
        "", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"
    ];

    private static readonly string[] scales = ["", "THOUSAND", "MILLION", "BILLION", "TRILLION"];

    private static string ConvertChunk(long num)
    {
        var result = "";
        var hundreds = num / 100;
        var remainder = num % 100;

        if (hundreds > 0)
        {
            result += $"{ones[hundreds]} HUNDRED ";
        }

        if (remainder > 0)
        {
            if (remainder < 20)
            {
                result += ones[remainder];
            }
            else
            {
                var ten = remainder / 10;
                var one = remainder % 10;
                result += tens[ten];
                if (one > 0)
                {
                    result += $"-{ones[one]}";
                }
            }
        }

        return result.Trim();
    }

    public static string ToPhilippinePesoWords(decimal amount)
    {
        if (amount == 0)
        {
            return "ZERO PESOS AND 00/100 (Php 0.00) ONLY";
        }

        var absoluteAmount = Math.Abs(amount);
        var integerPart = (long)Math.Truncate(absoluteAmount);
        var cents = (int)Math.Round((absoluteAmount - integerPart) * 100);

        string words;
        if (integerPart == 0)
        {
            words = "ZERO";
        }
        else
        {
            var currentNumber = integerPart;
            var scaleIndex = 0;
            var parts = new List<string>();

            while (currentNumber > 0)
            {
                var chunk = currentNumber % 1000;
                if (chunk > 0)
                {
                    var chunkWords = ConvertChunk(chunk);
                    var scale = scales[scaleIndex];
                    parts.Insert(0, string.IsNullOrEmpty(scale) ? chunkWords : $"{chunkWords} {scale}");
                }
                currentNumber /= 1000;
                scaleIndex++;
            }

            words = string.Join(" ", parts);
        }

        var formattedFigures = $"Php {absoluteAmount:N2}";
        var currencyUnit = integerPart == 1 ? "PESO" : "PESOS";
        return $"{words} {currencyUnit} AND {cents:D2}/100 ({formattedFigures}) ONLY";
    }
}

public record ResolvedSignatory
{
    public Guid? UserId { get; init; }
    public string FullName { get; init; } = string.Empty;
    public Guid? PositionId { get; init; }
    public string PositionTitle { get; init; } = string.Empty;
    public string FunctionalTitle { get; init; } = string.Empty;
    public string OfficeName { get; init; } = string.Empty;
}

public record ResolvedWorkflowApprovers(
    ResolvedSignatory? RecommendingApprover,
    ResolvedSignatory? FinalApprover);

public record ResolvedPmtSignatories(
    ResolvedSignatory? Chairperson,
    ResolvedSignatory? ViceChairperson,
    List<ResolvedSignatory> Members);

public static partial class DocumentSignatoryResolver
{
    public static async Task<ResolvedWorkflowApprovers> ResolveWorkflowApproversAsync(
        IUnitOfWork? unitOfWork,
        Guid? officeId,
        Guid? fiscalYearId = null,
        string? documentType = null,
        CancellationToken cancellationToken = default)
    {
        if (unitOfWork == null)
            return new ResolvedWorkflowApprovers(null, null);

        List<WorkflowMatrix>? candidates = null;

        if (unitOfWork.WorkflowMatrixRepository != null)
        {
            if (officeId.HasValue && officeId.Value != Guid.Empty)
            {
                candidates = await unitOfWork.WorkflowMatrixRepository.FindAllAsync(
                    w => w.OfficeId == officeId.Value && !w.IsDeleted,
                    cancellationToken);

                if (candidates == null || candidates.Count == 0)
                {
                    var single = await unitOfWork.WorkflowMatrixRepository.FindAsync(
                        w => w.OfficeId == officeId.Value && !w.IsDeleted,
                        cancellationToken);
                    if (single != null)
                        candidates = [single];
                }
            }

            if (candidates == null || candidates.Count == 0)
            {
                candidates = await unitOfWork.WorkflowMatrixRepository.FindAllAsync(
                    w => !w.IsDeleted,
                    cancellationToken);
            }
        }

        ResolvedSignatory? recommending = null;
        ResolvedSignatory? final = null;

        if (candidates != null && candidates.Count > 0)
        {
            var filtered = candidates
                .Where(w => string.IsNullOrWhiteSpace(documentType)
                    || string.Equals(w.DocumentType, documentType, StringComparison.OrdinalIgnoreCase)
                    || string.IsNullOrWhiteSpace(w.DocumentType))
                .ToList();

            if (filtered.Count == 0)
                filtered = candidates;

            var matrix = filtered
                .OrderByDescending(w => fiscalYearId.HasValue && fiscalYearId.Value != Guid.Empty && w.FiscalYearId == fiscalYearId.Value)
                .ThenByDescending(w => !string.IsNullOrWhiteSpace(documentType) && string.Equals(w.DocumentType, documentType, StringComparison.OrdinalIgnoreCase))
                .ThenByDescending(w => string.Equals(w.Status, "Active", StringComparison.OrdinalIgnoreCase))
                .FirstOrDefault();

            if (matrix != null)
            {
                if (matrix.RecommendingApproverPositionId != Guid.Empty)
                {
                    recommending = await ResolvePositionSignatoryAsync(
                        unitOfWork,
                        matrix.RecommendingApproverPositionId,
                        matrix.RecommendingApproverPosition,
                        cancellationToken);
                }

                if (matrix.FinalApproverPositionId != Guid.Empty)
                {
                    final = await ResolvePositionSignatoryAsync(
                        unitOfWork,
                        matrix.FinalApproverPositionId,
                        matrix.FinalApproverPosition,
                        cancellationToken);
                }
            }
        }

        recommending ??= await ResolveByPositionTitlesAsync(
            unitOfWork,
            [
                "Campus Chancellor",
                "Vice President for Planning and Finance",
                "Vice President for Administration",
                "Concerned Campus Vice President/Chancellor"
            ],
            cancellationToken);

        final ??= await ResolveByPositionTitlesAsync(
            unitOfWork,
            [
                "Head of the Procuring Entity",
                "University President",
                "President",
                "Agency Head"
            ],
            cancellationToken);

        return new ResolvedWorkflowApprovers(recommending, final);
    }

    public static async Task<ResolvedSignatory?> ResolveOfficeHeadSignatoryAsync(
        IUnitOfWork? unitOfWork,
        Guid? officeId,
        CancellationToken cancellationToken = default)
    {
        if (unitOfWork == null || !officeId.HasValue || officeId.Value == Guid.Empty)
            return null;

        if (unitOfWork.PositionRepository != null)
        {
            var positions = await unitOfWork.PositionRepository.FindAllAsync(
                p => p.OfficeId == officeId.Value && !p.IsDeleted,
                cancellationToken);

            if (positions != null && positions.Count > 0)
            {
                var orderedPositions = positions
                    .OrderByDescending(p =>
                        p.Title.Contains("Chief", StringComparison.OrdinalIgnoreCase) ||
                        p.Title.Contains("Director", StringComparison.OrdinalIgnoreCase) ||
                        p.Title.Contains("Head", StringComparison.OrdinalIgnoreCase) ||
                        p.Title.Contains("President", StringComparison.OrdinalIgnoreCase) ||
                        p.Title.Contains("Chancellor", StringComparison.OrdinalIgnoreCase) ||
                        p.Code.Contains("HEAD", StringComparison.OrdinalIgnoreCase) ||
                        p.Code.Contains("DIR", StringComparison.OrdinalIgnoreCase) ||
                        (p.FunctionalTitle != null && (
                            p.FunctionalTitle.Contains("Chief", StringComparison.OrdinalIgnoreCase) ||
                            p.FunctionalTitle.Contains("Director", StringComparison.OrdinalIgnoreCase) ||
                            p.FunctionalTitle.Contains("Head", StringComparison.OrdinalIgnoreCase))))
                    .ThenByDescending(p => string.Equals(p.OperationalStatus, nameof(PositionStatusEnum.Filled), StringComparison.OrdinalIgnoreCase))
                    .ToList();

                foreach (var pos in orderedPositions)
                {
                    var sig = await ResolvePositionSignatoryAsync(unitOfWork, pos.Id, pos, cancellationToken);
                    if (sig != null && !string.IsNullOrWhiteSpace(sig.FullName))
                        return sig;
                }
            }
        }

        if (unitOfWork.UserRepository != null)
        {
            var officeUsers = await unitOfWork.UserRepository.FindAllAsync(
                u => u.OfficeId == officeId.Value && !u.IsDeleted && u.IsActive,
                cancellationToken);

            var firstUser = officeUsers?.FirstOrDefault();
            if (firstUser != null)
            {
                var resolved = await ResolveUserSignatoryAsync(unitOfWork, firstUser.Id, cancellationToken);
                if (resolved != null && !string.IsNullOrWhiteSpace(resolved.FullName))
                    return resolved;

                return new ResolvedSignatory
                {
                    UserId = firstUser.Id,
                    FullName = firstUser.FullName.Trim(),
                    PositionTitle = firstUser.Office?.Name != null ? $"Head, {firstUser.Office.Name}" : "Division Chief",
                    OfficeName = firstUser.Office?.Name ?? string.Empty
                };
            }
        }

        return null;
    }

    public static async Task<ResolvedSignatory?> ResolveSubmitterSignatoryAsync(
        IUnitOfWork? unitOfWork,
        string entityType,
        Guid entityId,
        Guid? fallbackOfficeId = null,
        CancellationToken cancellationToken = default)
    {
        if (unitOfWork?.ApprovalEventRepository != null && entityId != Guid.Empty)
        {
            var events = await unitOfWork.ApprovalEventRepository.FindAllAsync(
                e => e.EntityId == entityId &&
                     string.Equals(e.EntityType, entityType, StringComparison.OrdinalIgnoreCase),
                cancellationToken);

            var submitEvent = events?
                .Where(e => string.Equals(e.Action, "Submitted", StringComparison.OrdinalIgnoreCase) ||
                            string.Equals(e.Action, "Submit", StringComparison.OrdinalIgnoreCase) ||
                            string.Equals(e.Action, "Created", StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(e => e.ActionAt)
                .FirstOrDefault()
                ?? events?.OrderBy(e => e.ActionAt).FirstOrDefault();

            if (submitEvent?.ActionByUserId != null && submitEvent.ActionByUserId != Guid.Empty)
            {
                var resolved = await ResolveUserSignatoryAsync(unitOfWork, submitEvent.ActionByUserId.Value, cancellationToken);
                if (resolved != null && !string.IsNullOrWhiteSpace(resolved.FullName))
                    return resolved;
            }
        }

        if (fallbackOfficeId.HasValue && fallbackOfficeId.Value != Guid.Empty)
        {
            return await ResolveOfficeHeadSignatoryAsync(unitOfWork, fallbackOfficeId, cancellationToken);
        }

        return null;
    }

    public static async Task<ResolvedSignatory?> ResolvePositionSignatoryAsync(
        IUnitOfWork? unitOfWork,
        Guid positionId,
        Position? navigationPosition = null,
        CancellationToken cancellationToken = default)
    {
        if (unitOfWork == null || positionId == Guid.Empty)
            return null;

        var position = navigationPosition;
        if (position == null && unitOfWork.PositionRepository != null)
        {
            position = await unitOfWork.PositionRepository.GetByIdAsync(positionId, cancellationToken);
        }

        PersonnelPosition? activeAssignment = null;
        if (unitOfWork.PersonnelPositionRepository != null)
        {
            var assignments = await unitOfWork.PersonnelPositionRepository.GetByPositionIdAsync(positionId, cancellationToken);
            activeAssignment = assignments?
                .Where(pp => !pp.IsDeleted)
                .OrderByDescending(pp => pp.IsActive)
                .ThenByDescending(pp => pp.StartDate)
                .FirstOrDefault();

            activeAssignment ??= await unitOfWork.PersonnelPositionRepository.FindAsync(
                pp => pp.PositionId == positionId && !pp.IsDeleted,
                cancellationToken);
        }

        position ??= activeAssignment?.Position;

        User? user = activeAssignment?.User;
        if (user == null && activeAssignment != null && activeAssignment.UserId != Guid.Empty && unitOfWork.UserRepository != null)
        {
            user = await unitOfWork.UserRepository.GetByIdAsync(activeAssignment.UserId, cancellationToken);
        }

        var fullName = user?.FullName?.Trim() ?? string.Empty;
        var posTitle = position?.Title?.Trim() ?? string.Empty;
        var funcTitle = position?.FunctionalTitle?.Trim() ?? string.Empty;
        var officeName = position?.Office?.Name?.Trim() ?? user?.Office?.Name?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(fullName) && string.IsNullOrWhiteSpace(posTitle))
            return null;

        return new ResolvedSignatory
        {
            UserId = user?.Id ?? activeAssignment?.UserId,
            FullName = fullName,
            PositionId = position?.Id ?? positionId,
            PositionTitle = posTitle,
            FunctionalTitle = funcTitle,
            OfficeName = officeName
        };
    }

    public static async Task<ResolvedSignatory?> ResolveUserSignatoryAsync(
        IUnitOfWork? unitOfWork,
        Guid? userId,
        CancellationToken cancellationToken = default)
    {
        if (unitOfWork == null || !userId.HasValue || userId.Value == Guid.Empty)
            return null;

        User? user = null;
        if (unitOfWork.UserRepository != null)
        {
            user = await unitOfWork.UserRepository.GetByIdAsync(userId.Value, cancellationToken);
        }

        PersonnelPosition? activeAssignment = user?.PersonnelPositions?
            .Where(pp => !pp.IsDeleted)
            .OrderByDescending(pp => pp.IsActive)
            .ThenByDescending(pp => pp.StartDate)
            .FirstOrDefault();

        if (activeAssignment == null && unitOfWork.PersonnelPositionRepository != null)
        {
            var assignments = await unitOfWork.PersonnelPositionRepository.GetByUserIdAsync(userId.Value, cancellationToken);
            activeAssignment = assignments?
                .Where(pp => !pp.IsDeleted)
                .OrderByDescending(pp => pp.IsActive)
                .ThenByDescending(pp => pp.StartDate)
                .FirstOrDefault();

            activeAssignment ??= await unitOfWork.PersonnelPositionRepository.FindAsync(
                pp => pp.UserId == userId.Value && !pp.IsDeleted,
                cancellationToken);
        }

        var position = activeAssignment?.Position;
        if (position == null && activeAssignment != null && activeAssignment.PositionId != Guid.Empty && unitOfWork.PositionRepository != null)
        {
            position = await unitOfWork.PositionRepository.GetByIdAsync(activeAssignment.PositionId, cancellationToken);
        }

        var fullName = user?.FullName?.Trim() ?? activeAssignment?.User?.FullName?.Trim() ?? string.Empty;
        var posTitle = position?.Title?.Trim() ?? string.Empty;
        var funcTitle = position?.FunctionalTitle?.Trim() ?? string.Empty;
        var officeName = position?.Office?.Name?.Trim() ?? user?.Office?.Name?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(fullName) && string.IsNullOrWhiteSpace(posTitle))
            return null;

        return new ResolvedSignatory
        {
            UserId = userId.Value,
            FullName = fullName,
            PositionId = position?.Id ?? activeAssignment?.PositionId,
            PositionTitle = posTitle,
            FunctionalTitle = funcTitle,
            OfficeName = officeName
        };
    }

    public static async Task<ResolvedSignatory?> ResolveByPositionTitlesAsync(
        IUnitOfWork? unitOfWork,
        IEnumerable<string> positionTitles,
        CancellationToken cancellationToken = default)
    {
        if (unitOfWork == null)
            return null;

        if (unitOfWork.PersonnelPositionRepository != null)
        {
            foreach (var title in positionTitles)
            {
                var assignment = await unitOfWork.PersonnelPositionRepository.GetActiveByPositionTitleAsync(title, cancellationToken);
                if (assignment != null)
                {
                    var user = assignment.User;
                    if (user == null && assignment.UserId != Guid.Empty && unitOfWork.UserRepository != null)
                        user = await unitOfWork.UserRepository.GetByIdAsync(assignment.UserId, cancellationToken);

                    var pos = assignment.Position;
                    if (pos == null && assignment.PositionId != Guid.Empty && unitOfWork.PositionRepository != null)
                        pos = await unitOfWork.PositionRepository.GetByIdAsync(assignment.PositionId, cancellationToken);

                    if (!string.IsNullOrWhiteSpace(user?.FullName))
                    {
                        return new ResolvedSignatory
                        {
                            UserId = user.Id,
                            FullName = user.FullName.Trim(),
                            PositionId = pos?.Id ?? assignment.PositionId,
                            PositionTitle = pos?.Title?.Trim() ?? title,
                            FunctionalTitle = pos?.FunctionalTitle?.Trim() ?? string.Empty,
                            OfficeName = pos?.Office?.Name?.Trim() ?? user.Office?.Name?.Trim() ?? string.Empty
                        };
                    }
                }
            }
        }

        return null;
    }

    public static async Task<ResolvedSignatory?> ResolveFinanceSignatoryAsync(
        IUnitOfWork? unitOfWork,
        CancellationToken cancellationToken = default)
    {
        if (unitOfWork == null)
            return null;

        var byTitle = await ResolveByPositionTitlesAsync(
            unitOfWork,
            [
                "Budget Officer",
                "Director of Financial Management Services",
                "Director, Financial Management Services",
                "Director, Finance Division",
                "Head, Budget Office",
                "Chief Accountant",
                "Agency Chief Accountant"
            ],
            cancellationToken);

        if (byTitle != null && !string.IsNullOrWhiteSpace(byTitle.FullName))
            return byTitle;

        if (unitOfWork.UserRepository != null)
        {
            var financeUsers = await unitOfWork.UserRepository.FindAllAsync(
                u => !u.IsDeleted && u.Office != null &&
                     (u.Office.Code == "FMS" ||
                      u.Office.Name.Contains("Finance") ||
                      u.Office.Name.Contains("Budget") ||
                      u.Office.Name.Contains("Accounting")),
                cancellationToken);

            var fUser = financeUsers?.FirstOrDefault();
            if (fUser != null)
            {
                var resolved = await ResolveUserSignatoryAsync(unitOfWork, fUser.Id, cancellationToken);
                if (resolved != null && !string.IsNullOrWhiteSpace(resolved.FullName))
                    return resolved;

                return new ResolvedSignatory
                {
                    UserId = fUser.Id,
                    FullName = fUser.FullName.Trim(),
                    PositionTitle = "Director, Financial Management Services",
                    OfficeName = fUser.Office?.Name ?? "Financial Management Services"
                };
            }
        }

        return null;
    }

    public static async Task<ResolvedSignatory?> ResolveSupplySignatoryAsync(
        IUnitOfWork? unitOfWork,
        CancellationToken cancellationToken = default)
    {
        if (unitOfWork == null)
            return null;

        var byTitle = await ResolveByPositionTitlesAsync(
            unitOfWork,
            [
                "Supply Officer",
                "Property Officer",
                "Head, Supply and Property Management Office",
                "Agency Property/Supply Officer"
            ],
            cancellationToken);

        if (byTitle != null && !string.IsNullOrWhiteSpace(byTitle.FullName))
            return byTitle;

        if (unitOfWork.UserRepository != null)
        {
            var supplyUsers = await unitOfWork.UserRepository.FindAllAsync(
                u => !u.IsDeleted && u.Office != null &&
                     (u.Office.Code == "SPMO" ||
                      u.Office.Name.Contains("Property") ||
                      u.Office.Name.Contains("Supply")),
                cancellationToken);

            var sUser = supplyUsers?.FirstOrDefault();
            if (sUser != null)
            {
                var resolved = await ResolveUserSignatoryAsync(unitOfWork, sUser.Id, cancellationToken);
                if (resolved != null && !string.IsNullOrWhiteSpace(resolved.FullName))
                    return resolved;

                return new ResolvedSignatory
                {
                    UserId = sUser.Id,
                    FullName = sUser.FullName.Trim(),
                    PositionTitle = "Agency Property/Supply Officer",
                    OfficeName = sUser.Office?.Name ?? "Supply and Property Management Office"
                };
            }
        }

        return null;
    }

    public static async Task<List<BACMember>> ResolveActiveBacMembersAsync(
        IUnitOfWork? unitOfWork,
        CancellationToken cancellationToken = default)
    {
        if (unitOfWork?.BACMemberRepository == null)
            return [];

        var members = await unitOfWork.BACMemberRepository.FindAllAsync(
            m => m.IsActive && !m.IsDeleted,
            cancellationToken);

        return members?
            .OrderBy(m => m.Order)
            .ToList() ?? [];
    }

    public static async Task<ResolvedPmtSignatories> ResolvePmtSignatoriesAsync(
        IUnitOfWork? unitOfWork,
        int? activeYear = null,
        CancellationToken cancellationToken = default)
    {
        if (unitOfWork?.PMTMemberRepository == null)
            return new ResolvedPmtSignatories(null, null, []);

        var members = await unitOfWork.PMTMemberRepository.FindAllAsync(
            m => m.IsActive && !m.IsDeleted,
            cancellationToken);

        if (members == null || members.Count == 0)
            return new ResolvedPmtSignatories(null, null, []);

        if (activeYear.HasValue && members.Any(m => m.PMT != null))
        {
            var yearFiltered = members.Where(m => m.PMT?.ActiveYear == activeYear.Value).ToList();
            if (yearFiltered.Count > 0)
                members = yearFiltered;
        }

        ResolvedSignatory? chair = null;
        ResolvedSignatory? viceChair = null;
        var regularMembers = new List<ResolvedSignatory>();

        foreach (var member in members)
        {
            var resolved = member.User != null && !string.IsNullOrWhiteSpace(member.User.FullName)
                ? new ResolvedSignatory
                {
                    UserId = member.UserId,
                    FullName = member.User.FullName.Trim(),
                    PositionTitle = member.User.PersonnelPositions?.FirstOrDefault(pp => pp.IsActive)?.Position?.Title ?? member.Role,
                    OfficeName = member.User.Office?.Name ?? string.Empty
                }
                : await ResolveUserSignatoryAsync(unitOfWork, member.UserId, cancellationToken);

            if (resolved == null || string.IsNullOrWhiteSpace(resolved.FullName))
                continue;

            if (string.Equals(member.Role, nameof(PMTRoleEnum.Chair), StringComparison.OrdinalIgnoreCase) ||
                string.Equals(member.Role, "Chairperson", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(member.Role, "Chairman", StringComparison.OrdinalIgnoreCase))
            {
                chair ??= resolved;
            }
            else if (string.Equals(member.Role, nameof(PMTRoleEnum.ViceChair), StringComparison.OrdinalIgnoreCase) ||
                     string.Equals(member.Role, "ViceChairperson", StringComparison.OrdinalIgnoreCase) ||
                     string.Equals(member.Role, "Co-Chairman", StringComparison.OrdinalIgnoreCase))
            {
                viceChair ??= resolved;
            }
            else
            {
                regularMembers.Add(resolved);
            }
        }

        return new ResolvedPmtSignatories(chair, viceChair, regularMembers);
    }
}

