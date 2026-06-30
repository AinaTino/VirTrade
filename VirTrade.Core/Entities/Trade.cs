using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VirTrade.Core.Entities;

public class Trade
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int Quantite { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal PrixExecution { get; set; }

    public DateTime ExecutedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public int BuyOrderId { get; set; }

    public Ordre BuyOrder { get; set; }

    [Required]
    public int SellOrderId { get; set; }

    public Ordre SellOrder { get; set; }

    [Required]
    public int StockId { get; set; }

    public Stock Stock { get; set; }
}