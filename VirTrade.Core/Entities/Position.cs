using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VirTrade.Core.Entities;

public class Position
{
    [Key]
    public int Id { get; set; }

    public int QuantiteDetenue { get; set; } = 0;

    [Column(TypeName = "decimal(18,4)")]
    public decimal PrixMoyenAchat { get; set; } = 0;

    [Required]
    public int PortefeuilleId { get; set; }

    public Portefeuille Portefeuille { get; set; }

    [Required]
    public int StockId { get; set; }

    public Stock Stock { get; set; }
}