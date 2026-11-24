using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;

namespace ERPEZ.Infrastructure.Services;

public class AgencyLetterheadService(IUnitOfWork unitOfWork) : IAgencyLetterheadService
{
    public async Task<AgencyLetterheadDto> GetLetterheadAsync(CancellationToken cancellationToken = default)
    {
        var agency = await unitOfWork.AgencyRepository.FindAsync(a => !a.IsDeleted, cancellationToken);

        var rootOffice = await unitOfWork.OfficeRepository.FindAsync(o => o.ParentId == null && !o.IsDeleted, cancellationToken)
            ?? await unitOfWork.OfficeRepository.FindAsync(o => !o.IsDeleted, cancellationToken);

        string officeName = rootOffice != null &&
                            !string.IsNullOrWhiteSpace(rootOffice.Name) &&
                            !rootOffice.Name.Contains("SuperAdmin", StringComparison.OrdinalIgnoreCase)
            ? rootOffice.Name.Trim()
            : string.Empty;

        if (agency != null)
        {
            return new AgencyLetterheadDto
            {
                Id = agency.Id,
                Name = agency.Name,
                Address = agency.Address ?? string.Empty,
                OfficeName = officeName,
                HasLogo = agency.LogoImage != null && agency.LogoImage.Length > 0,
                LogoBytes = agency.LogoImage,
                LetterheadAlignment = agency.LetterheadAlignment ?? "Default"
            };
        }

        // Fallback to top Organization and Office if no Agency record exists for this tenant
        var topOrg = await unitOfWork.OrganizationRepository.FindAsync(o => o.ParentId == null && !o.IsDeleted, cancellationToken)
            ?? await unitOfWork.OrganizationRepository.FindAsync(o => !o.IsDeleted, cancellationToken);

        var candidate = topOrg?.Name?.Trim()
            ?? (rootOffice?.Organization != null ? rootOffice.Organization.Name?.Trim() : null)
            ?? (rootOffice != null && !string.IsNullOrWhiteSpace(rootOffice.Name) ? rootOffice.Name.Trim() : null)
            ?? string.Empty;

        string fallbackName = !string.IsNullOrWhiteSpace(candidate) &&
                              !candidate.Equals("USTP", StringComparison.OrdinalIgnoreCase) &&
                              !candidate.Contains("SuperAdmin", StringComparison.OrdinalIgnoreCase) &&
                              !candidate.Contains("Workspace", StringComparison.OrdinalIgnoreCase)
            ? candidate
            : "Agency Name";

        return new AgencyLetterheadDto
        {
            Id = null,
            Name = fallbackName,
            Address = string.Empty,
            OfficeName = officeName,
            HasLogo = false,
            LogoBytes = null,
            LetterheadAlignment = "Default"
        };
    }

    public async Task<AgencyLetterheadDto> UpdateLetterheadAsync(UpdateAgencyLetterheadRequest request, CancellationToken cancellationToken = default)
    {
        var agency = await unitOfWork.AgencyRepository.FindAsync(a => !a.IsDeleted, cancellationToken);
        if (agency == null)
        {
            agency = new Agency
            {
                Name = request.Name.Trim(),
                Address = request.Address?.Trim() ?? string.Empty,
                LogoImage = request.UpdateLogo ? request.LogoBytes : null,
                LetterheadAlignment = !string.IsNullOrWhiteSpace(request.LetterheadAlignment) ? request.LetterheadAlignment.Trim() : "Default"
            };
            await unitOfWork.AgencyRepository.AddAsync(agency, cancellationToken);
        }
        else
        {
            agency.Name = request.Name.Trim();
            agency.Address = request.Address?.Trim() ?? string.Empty;
            if (request.UpdateLogo)
            {
                agency.LogoImage = request.LogoBytes;
            }
            if (!string.IsNullOrWhiteSpace(request.LetterheadAlignment))
            {
                agency.LetterheadAlignment = request.LetterheadAlignment.Trim();
            }
            unitOfWork.AgencyRepository.Update(agency);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new AgencyLetterheadDto
        {
            Id = agency.Id,
            Name = agency.Name,
            Address = agency.Address,
            OfficeName = string.Empty,
            HasLogo = agency.LogoImage != null && agency.LogoImage.Length > 0,
            LogoBytes = agency.LogoImage,
            LetterheadAlignment = agency.LetterheadAlignment ?? "Default"
        };
    }

    public async Task<byte[]?> GetLogoAsync(CancellationToken cancellationToken = default)
    {
        var agency = await unitOfWork.AgencyRepository.FindAsync(a => !a.IsDeleted, cancellationToken);
        return agency?.LogoImage;
    }

    public async Task ClearLogoAsync(CancellationToken cancellationToken = default)
    {
        var agency = await unitOfWork.AgencyRepository.FindAsync(a => !a.IsDeleted, cancellationToken);
        if (agency != null)
        {
            agency.LogoImage = null;
            unitOfWork.AgencyRepository.Update(agency);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
