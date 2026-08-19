using System;
using ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;
using ERPEZ.Domain.Enums;
using FluentValidation.TestHelper;
using Xunit;

namespace ERPEZ.Dashboard.Application.UnitTests.Features.Procurement.Commands.CreateProcurementProject;

public class CreateProcurementProjectCommandValidatorTests
{
    private readonly CreateProcurementProjectCommandValidator validator = new();

    [Fact]
    public void Validate_AppItemSource_Valid_PassesValidation()
    {
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.APPItem,
            APPItemId = Guid.NewGuid(),
            ConsolidatedPRId = null,
            ResolutionNumber = "BAC-RES-2026-001",
            Title = "Test Title",
            ABC = 100000
        };

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_AppItemSource_MissingAppItemId_FailsValidation()
    {
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.APPItem,
            APPItemId = null,
            ConsolidatedPRId = null,
            ResolutionNumber = "BAC-RES-2026-001",
            Title = "Test Title",
            ABC = 100000
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.APPItemId);
    }

    [Fact]
    public void Validate_AppItemSource_ConsolidatedPRIdProvided_FailsValidation()
    {
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.APPItem,
            APPItemId = Guid.NewGuid(),
            ConsolidatedPRId = Guid.NewGuid(),
            ResolutionNumber = "BAC-RES-2026-001",
            Title = "Test Title",
            ABC = 100000
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ConsolidatedPRId);
    }

    [Fact]
    public void Validate_ConsolidatedPrSource_Valid_PassesValidation()
    {
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.ConsolidatedPR,
            ConsolidatedPRId = Guid.NewGuid(),
            APPItemId = null,
            ResolutionNumber = "BAC-RES-2026-002",
            Title = "Test Title",
            ABC = 100000
        };

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_ConsolidatedPrSource_MissingConsolidatedPRId_FailsValidation()
    {
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.ConsolidatedPR,
            ConsolidatedPRId = null,
            APPItemId = null,
            ResolutionNumber = "BAC-RES-2026-002",
            Title = "Test Title",
            ABC = 100000
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ConsolidatedPRId);
    }

    [Fact]
    public void Validate_MissingResolutionNumber_FailsValidation()
    {
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.ConsolidatedPR,
            ConsolidatedPRId = Guid.NewGuid(),
            ResolutionNumber = "",
            Title = "Test Title",
            ABC = 100000
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ResolutionNumber);
    }
}
