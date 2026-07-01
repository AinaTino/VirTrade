using System.ComponentModel.DataAnnotations;

namespace VirTrade.Core.Entities;

public class ConfigMarche
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public required string Cle { get; set; }

    [Required, MaxLength(255)]
    public required string Valeur { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }
}