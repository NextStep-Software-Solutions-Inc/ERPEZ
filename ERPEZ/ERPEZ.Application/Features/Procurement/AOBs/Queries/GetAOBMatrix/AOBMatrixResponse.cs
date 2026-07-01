using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBMatrix;

public class AOBMatrixResponse
{
    public Guid AOBId { get; set; }
    public string AOBNumber { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string AwardCriterion { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateOnly AOBDate { get; set; }
    public DateTime OpeningDate { get; set; }

    public List<AOBProjectDto> LinkedProjects { get; set; } = [];
    public List<AOBMatrixSupplierDto> Suppliers { get; set; } = [];
    public List<AOBMatrixItemDto> Items { get; set; } = [];
    public List<AOBMatrixBidCellDto> Bids { get; set; } = [];
}

public class AOBProjectDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal ABC { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class AOBMatrixSupplierDto
{
    public Guid SupplierId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class AOBMatrixItemDto
{
    public Guid APPItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string PAPCode { get; set; } = string.Empty;
    public decimal ABCUnitPrice { get; set; }
    public int TotalQuantity { get; set; }
    public decimal TotalABC { get; set; }
}

public class AOBMatrixBidCellDto
{
    public Guid? BidItemId { get; set; }
    public Guid SupplierId { get; set; }
    public Guid APPItemId { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? Color { get; set; }
    public string? BrochureFileUrl { get; set; }
    public bool IsResponsive { get; set; }
    public bool IsOverABC { get; set; }
    public int Rank { get; set; }
    public decimal Score { get; set; }
}
