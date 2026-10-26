using System;
using System.Threading;
using System.Threading.Tasks;

namespace ERPEZ.Application.Interfaces.Services;

public sealed record AgencyLetterheadDto
{
    public Guid? Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string OfficeName { get; init; } = string.Empty;
    public bool HasLogo { get; init; }
    public byte[]? LogoBytes { get; init; }
    public string LetterheadAlignment { get; init; } = "Default";
}

public sealed record UpdateAgencyLetterheadRequest
{
    public string Name { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public byte[]? LogoBytes { get; init; }
    public bool UpdateLogo { get; init; }
    public string? LetterheadAlignment { get; init; }
}

public interface IAgencyLetterheadService
{
    Task<AgencyLetterheadDto> GetLetterheadAsync(CancellationToken cancellationToken = default);
    Task<AgencyLetterheadDto> UpdateLetterheadAsync(UpdateAgencyLetterheadRequest request, CancellationToken cancellationToken = default);
    Task<byte[]?> GetLogoAsync(CancellationToken cancellationToken = default);
    Task ClearLogoAsync(CancellationToken cancellationToken = default);
}
