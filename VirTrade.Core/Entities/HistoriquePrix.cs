using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VirTrade.Core.Entities;

public class HistoriquePrix
{
    [Key]
    public int Id { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal Open { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal High { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal Low { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal Close { get; set; }

    public int Volume { get; set; }

    public DateTime Timestamp { get; set; }

    [Required]
    public int StockId { get; set; }

    public Stock Stock { get; set; }
}