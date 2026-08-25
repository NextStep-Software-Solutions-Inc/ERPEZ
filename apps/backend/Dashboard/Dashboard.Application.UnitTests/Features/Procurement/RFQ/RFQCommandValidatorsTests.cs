using System;
using System.Collections.Generic;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.CreateRFQ;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.UpdateRFQ;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.RequestForQuotation;

public class RFQCommandValidatorsTests
{
    private readonly CreateRFQCommandValidator createValidator = new();
    private readonly UpdateRFQCommandValidator updateValidator = new();

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(2)]
    public void CreateRFQCommandValidator_WhenFewerThan3Suppliers_ShouldFail(int supplierCount)
    {
        var supplierIds = new List<Guid>();
        for (var i = 0; i < supplierCount; i++)
        {
            supplierIds.Add(Guid.NewGuid());
        }

        var command = new CreateRFQCommand(
            RFQNumber: "RFQ-2026-001",
            TracingNumber: "TR-2026-001",
            Description: "Test Description",
            Date: DateOnly.FromDateTime(DateTime.UtcNow),
            Deadline: null,
            DeliveryPeriod: "7 days",
            Purpose: "Test Purpose",
            SupplierIds: supplierIds
        );

        var result = createValidator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateRFQCommand.SupplierIds) && e.ErrorMessage.Contains("at least 3"));
    }

    [Fact]
    public void CreateRFQCommandValidator_WhenDuplicateSuppliersResultInLessThan3_ShouldFail()
    {
        var supplier1 = Guid.NewGuid();
        var supplier2 = Guid.NewGuid();

        var command = new CreateRFQCommand(
            RFQNumber: "RFQ-2026-001",
            TracingNumber: "TR-2026-001",
            Description: "Test Description",
            Date: DateOnly.FromDateTime(DateTime.UtcNow),
            Deadline: null,
            DeliveryPeriod: "7 days",
            Purpose: "Test Purpose",
            SupplierIds: new List<Guid> { supplier1, supplier2, supplier1 } // 3 items, but only 2 distinct
        );

        var result = createValidator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateRFQCommand.SupplierIds) && e.ErrorMessage.Contains("at least 3"));
    }

    [Fact]
    public void CreateRFQCommandValidator_When3OrMoreDistinctSuppliers_ShouldPass()
    {
        var command = new CreateRFQCommand(
            RFQNumber: "RFQ-2026-001",
            TracingNumber: "TR-2026-001",
            Description: "Test Description",
            Date: DateOnly.FromDateTime(DateTime.UtcNow),
            Deadline: null,
            DeliveryPeriod: "7 days",
            Purpose: "Test Purpose",
            SupplierIds: new List<Guid> { Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid() }
        );

        var result = createValidator.Validate(command);

        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(2)]
    public void UpdateRFQCommandValidator_WhenFewerThan3Suppliers_ShouldFail(int supplierCount)
    {
        var supplierIds = new List<Guid>();
        for (var i = 0; i < supplierCount; i++)
        {
            supplierIds.Add(Guid.NewGuid());
        }

        var command = new UpdateRFQCommand
        {
            RFQId = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-001",
            TracingNumber = "TR-2026-001",
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            SupplierIds = supplierIds
        };

        var result = updateValidator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateRFQCommand.SupplierIds) && e.ErrorMessage.Contains("at least 3"));
    }

    [Fact]
    public void UpdateRFQCommandValidator_When3OrMoreDistinctSuppliers_ShouldPass()
    {
        var command = new UpdateRFQCommand
        {
            RFQId = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-001",
            TracingNumber = "TR-2026-001",
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            SupplierIds = new List<Guid> { Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid() }
        };

        var result = updateValidator.Validate(command);

        result.IsValid.Should().BeTrue();
    }
}
