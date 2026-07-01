using Microsoft.EntityFrameworkCore;
using VirTrade.Core.Entities;
using VirTrade.Infrastructure.Persistence.Configurations;

namespace VirTrade.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Utilisateur> Utilisateurs { get; set; }
        public DbSet<Portefeuille> Portefeuilles { get; set; }
        public DbSet<Position> Positions { get; set; }
        public DbSet<Stock> Stocks { get; set; }
        public DbSet<Ordre> Ordres { get; set; }
        public DbSet<Trade> Trades { get; set; }
        public DbSet<HistoriquePrix> HistoriquesPrix { get; set; }
        // TODO : ajouter DbSet<ConfigMarche> une fois ConfigMarche.cs livré par Membre 1

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configurations séparées (section 15.6 du document)
            modelBuilder.ApplyConfiguration(new UtilisateurConfig());
            modelBuilder.ApplyConfiguration(new OrdreConfig());
            modelBuilder.ApplyConfiguration(new TradeConfig());

            // Stock — symbole unique (section 7.5)
            modelBuilder.Entity<Stock>()
                .HasIndex(s => s.Symbole)
                .IsUnique();

            // Position — contrainte unique (portefeuille_id, stock_id) (section 7.5)
            modelBuilder.Entity<Position>()
                .HasIndex(p => new { p.PortefeuilleId, p.StockId })
                .IsUnique();

            // Position → Portefeuille
            modelBuilder.Entity<Position>()
                .HasOne(p => p.Portefeuille)
                .WithMany(pf => pf.Positions)
                .HasForeignKey(p => p.PortefeuilleId);

            // Position → Stock
            modelBuilder.Entity<Position>()
                .HasOne(p => p.Stock)
                .WithMany(s => s.Positions)
                .HasForeignKey(p => p.StockId);

            // HistoriquePrix → Stock
            modelBuilder.Entity<HistoriquePrix>()
                .HasOne(h => h.Stock)
                .WithMany(s => s.HistoriquePrix)
                .HasForeignKey(h => h.StockId);

            // Index sur historique_prix(stock_id, timestamp) (section 7.5)
            modelBuilder.Entity<HistoriquePrix>()
                .HasIndex(h => new { h.StockId, h.Timestamp });

            // Seed stocks (section 14 du document)
            modelBuilder.Entity<Stock>().HasData(
                new Stock { Id = 1, Symbole = "AAPL", NomComplet = "Apple Inc.", PrixActuel = 150.00m, Volatilite = 0.015m },
                new Stock { Id = 2, Symbole = "TSLA", NomComplet = "Tesla Inc.", PrixActuel = 250.00m, Volatilite = 0.025m },
                new Stock { Id = 3, Symbole = "MSFT", NomComplet = "Microsoft Corp.", PrixActuel = 380.00m, Volatilite = 0.012m },
                new Stock { Id = 4, Symbole = "AMZN", NomComplet = "Amazon.com Inc.", PrixActuel = 175.00m, Volatilite = 0.018m },
                new Stock { Id = 5, Symbole = "NVDA", NomComplet = "NVIDIA Corp.", PrixActuel = 800.00m, Volatilite = 0.030m }
            );
        }
    }
}