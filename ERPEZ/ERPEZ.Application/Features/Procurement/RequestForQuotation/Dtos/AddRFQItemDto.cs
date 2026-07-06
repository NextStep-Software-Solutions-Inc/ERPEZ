namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;

public record AddRFQItemDto(
    Guid CPRItemId,
    int Quantity,
    bool IsBrochureRequired,
    string? GreenSpecification
);
