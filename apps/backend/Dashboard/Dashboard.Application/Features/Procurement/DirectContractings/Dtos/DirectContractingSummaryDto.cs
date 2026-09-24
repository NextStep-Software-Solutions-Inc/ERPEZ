using System;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;

public record DirectContractingSummaryDto
{
    public int Total { get; init; }
    public int Draft { get; init; }
    public int ForReview { get; init; }
    public int SubmittedToSupplier { get; init; }
    public int PendingForApproval { get; init; }
    public int Approved { get; init; }
    public int Returned { get; init; }
}
