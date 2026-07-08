using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace VirTrade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConfigsMarche",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Cle = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Valeur = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfigsMarche", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Stocks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Symbole = table.Column<string>(type: "TEXT", maxLength: 10, nullable: false),
                    NomComplet = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    PrixActuel = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    Volatilite = table.Column<decimal>(type: "decimal(5,4)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stocks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Utilisateurs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nom = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Utilisateurs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HistoriquesPrix",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Open = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    High = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    Low = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    Close = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    Volume = table.Column<int>(type: "INTEGER", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    StockId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoriquesPrix", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistoriquesPrix_Stocks_StockId",
                        column: x => x.StockId,
                        principalTable: "Stocks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Ordres",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TypeOrdre = table.Column<int>(type: "INTEGER", nullable: false),
                    SensOrdre = table.Column<int>(type: "INTEGER", nullable: false),
                    Quantite = table.Column<int>(type: "INTEGER", nullable: false),
                    QuantiteExecutee = table.Column<int>(type: "INTEGER", nullable: false),
                    PrixLimite = table.Column<decimal>(type: "decimal(18,4)", nullable: true),
                    Statut = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UtilisateurId = table.Column<int>(type: "INTEGER", nullable: false),
                    StockId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ordres", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ordres_Stocks_StockId",
                        column: x => x.StockId,
                        principalTable: "Stocks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Ordres_Utilisateurs_UtilisateurId",
                        column: x => x.UtilisateurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Portefeuilles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SoldeCash = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UtilisateurId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Portefeuilles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Portefeuilles_Utilisateurs_UtilisateurId",
                        column: x => x.UtilisateurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Trades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Quantite = table.Column<int>(type: "INTEGER", nullable: false),
                    PrixExecution = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    ExecutedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    BuyOrderId = table.Column<int>(type: "INTEGER", nullable: false),
                    SellOrderId = table.Column<int>(type: "INTEGER", nullable: false),
                    StockId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trades", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Trades_Ordres_BuyOrderId",
                        column: x => x.BuyOrderId,
                        principalTable: "Ordres",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Trades_Ordres_SellOrderId",
                        column: x => x.SellOrderId,
                        principalTable: "Ordres",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Trades_Stocks_StockId",
                        column: x => x.StockId,
                        principalTable: "Stocks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Positions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    QuantiteDetenue = table.Column<int>(type: "INTEGER", nullable: false),
                    PrixMoyenAchat = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    PortefeuilleId = table.Column<int>(type: "INTEGER", nullable: false),
                    StockId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Positions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Positions_Portefeuilles_PortefeuilleId",
                        column: x => x.PortefeuilleId,
                        principalTable: "Portefeuilles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Positions_Stocks_StockId",
                        column: x => x.StockId,
                        principalTable: "Stocks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "ConfigsMarche",
                columns: new[] { "Id", "Cle", "Description", "Valeur" },
                values: new object[,]
                {
                    { 1, "capital_initial", "Capital virtuel en USD à l'inscription", "100000" },
                    { 2, "tick_interval_ms", "Intervalle simulation prix en millisecondes", "3000" },
                    { 3, "volatilite_defaut", "Volatilité Brownian motion par défaut", "0.015" },
                    { 4, "market_impact_coeff", "Impact prix par tranche de 1000 actions tradées", "0.001" }
                });

            migrationBuilder.InsertData(
                table: "Stocks",
                columns: new[] { "Id", "NomComplet", "PrixActuel", "Symbole", "Volatilite" },
                values: new object[,]
                {
                    { 1, "Apple Inc.", 150.00m, "AAPL", 0.015m },
                    { 2, "Tesla Inc.", 250.00m, "TSLA", 0.025m },
                    { 3, "Microsoft Corp.", 380.00m, "MSFT", 0.012m },
                    { 4, "Amazon.com Inc.", 175.00m, "AMZN", 0.018m },
                    { 5, "NVIDIA Corp.", 800.00m, "NVDA", 0.030m }
                });

            migrationBuilder.CreateIndex(
                name: "IX_HistoriquesPrix_StockId_Timestamp",
                table: "HistoriquesPrix",
                columns: new[] { "StockId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_Ordres_Statut_StockId",
                table: "Ordres",
                columns: new[] { "Statut", "StockId" });

            migrationBuilder.CreateIndex(
                name: "IX_Ordres_StockId",
                table: "Ordres",
                column: "StockId");

            migrationBuilder.CreateIndex(
                name: "IX_Ordres_UtilisateurId",
                table: "Ordres",
                column: "UtilisateurId");

            migrationBuilder.CreateIndex(
                name: "IX_Portefeuilles_UtilisateurId",
                table: "Portefeuilles",
                column: "UtilisateurId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Positions_PortefeuilleId_StockId",
                table: "Positions",
                columns: new[] { "PortefeuilleId", "StockId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Positions_StockId",
                table: "Positions",
                column: "StockId");

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_Symbole",
                table: "Stocks",
                column: "Symbole",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Trades_BuyOrderId",
                table: "Trades",
                column: "BuyOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Trades_SellOrderId",
                table: "Trades",
                column: "SellOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Trades_StockId_ExecutedAt",
                table: "Trades",
                columns: new[] { "StockId", "ExecutedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Utilisateurs_Email",
                table: "Utilisateurs",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConfigsMarche");

            migrationBuilder.DropTable(
                name: "HistoriquesPrix");

            migrationBuilder.DropTable(
                name: "Positions");

            migrationBuilder.DropTable(
                name: "Trades");

            migrationBuilder.DropTable(
                name: "Portefeuilles");

            migrationBuilder.DropTable(
                name: "Ordres");

            migrationBuilder.DropTable(
                name: "Stocks");

            migrationBuilder.DropTable(
                name: "Utilisateurs");
        }
    }
}
