using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VirTrade.Core.Entities;

namespace VirTrade.Infrastructure.Persistence.Configurations
{
    public class UtilisateurConfig : IEntityTypeConfiguration<Utilisateur>
    {
        public void Configure(EntityTypeBuilder<Utilisateur> builder)
        {
            // Email unique (section 7.5)
            builder.HasIndex(u => u.Email).IsUnique();

            // One-to-One avec Portefeuille (section 7.3 — 1,1 -- 1,1)
            builder.HasOne(u => u.Portefeuille)
                .WithOne(p => p.Utilisateur)
                .HasForeignKey<Portefeuille>(p => p.UtilisateurId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-Many avec Ordre (section 7.3)
            builder.HasMany(u => u.Ordres)
                .WithOne(o => o.Utilisateur)
                .HasForeignKey(o => o.UtilisateurId);
        }
    }
}
