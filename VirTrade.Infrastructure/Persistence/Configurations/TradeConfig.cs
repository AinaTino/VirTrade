using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VirTrade.Core.Entities;

namespace VirTrade.Infrastructure.Persistence.Configurations
{
    public class TradeConfig : IEntityTypeConfiguration<Trade>
    {
        public void Configure(EntityTypeBuilder<Trade> builder)
        {
            // Index sur (stock_id, executed_at) (section 7.5)
            builder.HasIndex(t => new { t.StockId, t.ExecutedAt });

            // Trade → BuyOrder (double relation vers Ordre — section 7.3)
            builder.HasOne(t => t.BuyOrder)
                .WithMany(o => o.BuyTrades)
                .HasForeignKey(t => t.BuyOrderId)
                .OnDelete(DeleteBehavior.Restrict);

            // Trade → SellOrder
            builder.HasOne(t => t.SellOrder)
                .WithMany(o => o.SellTrades)
                .HasForeignKey(t => t.SellOrderId)
                .OnDelete(DeleteBehavior.Restrict);

            // Trade → Stock
            builder.HasOne(t => t.Stock)
                .WithMany()
                .HasForeignKey(t => t.StockId);
        }
    }
}