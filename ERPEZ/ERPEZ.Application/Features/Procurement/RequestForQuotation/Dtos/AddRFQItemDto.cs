namespace ERPEZ.Application.RFQ.Dtos;

public record AddRFQItemDto(
    Guid CPRItemId,
    int Quantity,
    bool IsBrochureRequired,
    string? GreenSpecification
);
