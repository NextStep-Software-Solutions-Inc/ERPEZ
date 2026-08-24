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

    [Fact]
    public void Validate_WhereasClauses_ValidSequential_PassesValidation()
    {
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.APPItem,
            APPItemId = Guid.NewGuid(),
            ResolutionNumber = "BAC-RES-2026-001",
            Title = "Test Title",
            ABC = 100000,
            WhereasClauses = new List<WhereasClauseItemInputDto>
            {
                new(Guid.NewGuid(), 0),
                new(Guid.NewGuid(), 1)
            }
        };

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhereasClauses_DuplicateWhereasClauseId_FailsValidation()
    {
        var sameId = Guid.NewGuid();
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.APPItem,
            APPItemId = Guid.NewGuid(),
            ResolutionNumber = "BAC-RES-2026-001",
            Title = "Test Title",
            ABC = 100000,
            WhereasClauses = new List<WhereasClauseItemInputDto>
            {
                new(sameId, 0),
                new(sameId, 1)
            }
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.WhereasClauses)
            .WithErrorMessage("Whereas clauses must not contain duplicate WhereasClauseId values.");
    }

    [Fact]
    public void Validate_WhereasClauses_DuplicateOrder_FailsValidation()
    {
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.APPItem,
            APPItemId = Guid.NewGuid(),
            ResolutionNumber = "BAC-RES-2026-001",
            Title = "Test Title",
            ABC = 100000,
            WhereasClauses = new List<WhereasClauseItemInputDto>
            {
                new(Guid.NewGuid(), 0),
                new(Guid.NewGuid(), 0)
            }
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.WhereasClauses)
            .WithErrorMessage("Whereas clauses must not contain duplicate Order values.");
    }

    [Fact]
    public void Validate_WhereasClauses_NonSequentialOrder_FailsValidation()
    {
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.APPItem,
            APPItemId = Guid.NewGuid(),
            ResolutionNumber = "BAC-RES-2026-001",
            Title = "Test Title",
            ABC = 100000,
            WhereasClauses = new List<WhereasClauseItemInputDto>
            {
                new(Guid.NewGuid(), 1),
                new(Guid.NewGuid(), 2)
            }
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.WhereasClauses)
            .WithErrorMessage("Whereas clause Order values must be sequential numbers starting from 0 to N-1.");
    }
}
