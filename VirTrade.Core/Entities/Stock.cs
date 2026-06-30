using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VirTrade.Core.Entities;

public class Stock
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(10)]
    public required string Symbole { get; set; }

    [Required, MaxLength(255)]
    public required string NomComplet { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal PrixActuel { get; set; }

    [Column(TypeName = "decimal(5,4)")]
    public decimal Volatilite { get; set; } = 0.015m;

    public ICollection<Ordre> Ordres { get; set; } = new List<Ordre>();
    public ICollection<Position> Positions { get; set; } = new List<Position>();
    public ICollection<HistoriquePrix> HistoriquePrix { get; set; } = new List<HistoriquePrix>();
}