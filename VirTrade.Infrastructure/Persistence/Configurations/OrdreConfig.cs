using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VirTrade.Core.Entities;

namespace VirTrade.Infrastructure.Persistence.Configurations
{
    public class OrdreConfig : IEntityTypeConfiguration<Ordre>
    {
        public void Configure(EntityTypeBuilder<Ordre> builder)
        {
            // Index sur (statut, stock_id) (section 7.5)
            builder.HasIndex(o => new { o.Statut, o.StockId });

            // Index sur utilisateur_id (section 7.5)
            builder.HasIndex(o => o.UtilisateurId);

            // Ordre → Stock
            builder.HasOne(o => o.Stock)
                .WithMany(s => s.Ordres)
                .HasForeignKey(o => o.StockId);
        }
    }
}