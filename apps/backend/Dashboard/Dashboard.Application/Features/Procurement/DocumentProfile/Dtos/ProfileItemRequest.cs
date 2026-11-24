namespace ERPEZ.Application.Features.Procurement.DocumentProfile.Dtos;

public record ProfileItemRequest
{
    public Guid MasterDocumentTypeId { get; init; }
    public int  OrderIndex           { get; init; }
}