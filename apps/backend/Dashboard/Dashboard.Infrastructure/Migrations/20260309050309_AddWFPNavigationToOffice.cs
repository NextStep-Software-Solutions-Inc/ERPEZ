using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWFPNavigationToOffice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // This migration is intentionally a no-operation. It is kept to preserve
            // migration history consistency.
            migrationBuilder.Sql("-- No-op migration retained intentionally (AddWFPNavigationToOffice, Up).");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // This migration is intentionally a no-operation. It is kept to preserve
            // migration history consistency.
            migrationBuilder.Sql("-- No-op migration retained intentionally (AddWFPNavigationToOffice, Down).");
        }
    }
}
