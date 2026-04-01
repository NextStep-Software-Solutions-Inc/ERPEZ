using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Application.Features.Planning.Office.Dtos;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ERPEZ.Api.Configuration;

/// <summary>
/// Breaks self-referential circular references in generated OpenAPI schemas.
/// Without this, Swagger UI freezes when rendering any endpoint whose response
/// contains one of these recursive types.
///
/// Affected types:
///   - ObjectResponse        — Parent: ObjectResponse?
///   - DeliveryUnitResponse  — SubDeliveryUnits: List&lt;DeliveryUnitResponse&gt;
///   - OfficeHierarchyResponse — Children: List&lt;OfficeHierarchyResponse&gt;
/// </summary>
public class BreakCircularReferenceSchemaFilter : ISchemaFilter
{
    private static readonly OpenApiSchema plainObject = new() { Type = "object", Nullable = true };
    private static readonly OpenApiSchema plainObjectArray = new()
    {
        Type = "array",
        Items = new OpenApiSchema { Type = "object" }
    };

    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type == typeof(ObjectResponse))
            ReplaceIfExists(schema, "parent", plainObject);
        else if (context.Type == typeof(DeliveryUnitResponse))
            ReplaceIfExists(schema, "subDeliveryUnits", plainObjectArray);
        else if (context.Type == typeof(OfficeHierarchyResponse))
            ReplaceIfExists(schema, "Children", plainObjectArray);
    }

    private static void ReplaceIfExists(OpenApiSchema schema, string key, OpenApiSchema replacement)
    {
        var match = schema.Properties.Keys
            .FirstOrDefault(k => string.Equals(k, key, StringComparison.OrdinalIgnoreCase));

        if (match is not null)
            schema.Properties[match] = replacement;
    }
}
