namespace ERPEZ.Application.Features.Planning.FiscalYear.Dtos;

public record UpdateStatusRequest
{
    public required string Status { get; init; }
}