using VirTrade.Core.Entities;
using VirTrade.Core.Enums;

namespace VirTrade.Core.Services;

public class OrderBook
{
    // Bids : décroissant → meilleur prix (le plus haut) en tête
    private readonly SortedDictionary<decimal, List<Ordre>> _bids
        = new(Comparer<decimal>.Create((a, b) => b.CompareTo(a)));

    // Asks : croissant → meilleur prix (le plus bas) en tête
    private readonly SortedDictionary<decimal, List<Ordre>> _asks = new();

    // Lock par book, pas global → un lock par ticker, pas pour tous les stocks
    private readonly object _lock = new();

    public string Symbole { get; }

    public OrderBook(string symbole)
    {
        Symbole = symbole;
    }

    // -----------------------------------------------------------------------
    // Écriture
    // -----------------------------------------------------------------------

    public void Inject(Ordre ordre)
    {
        lock (_lock)
        {
            var book = ordre.SensOrdre == SensOrdre.Buy ? _bids : _asks;

            // Market order : pas de PrixLimite → prix fictif pour la position
            // en tête de book (MaxValue côté bid = priorité absolue,
            // MinValue côté ask = idem)
            var prix = ordre.SensOrdre == SensOrdre.Buy
                ? ordre.PrixLimite ?? decimal.MaxValue
                : ordre.PrixLimite ?? decimal.MinValue;

            if (!book.ContainsKey(prix))
                book[prix] = [];

            book[prix].Add(ordre);
        }
    }

    public void Retirer(Ordre ordre)
    {
        lock (_lock)
        {
            var book = ordre.SensOrdre == SensOrdre.Buy ? _bids : _asks;

            var prix = ordre.SensOrdre == SensOrdre.Buy
                ? ordre.PrixLimite ?? decimal.MaxValue
                : ordre.PrixLimite ?? decimal.MinValue;

            if (!book.TryGetValue(prix, out var liste))
                return;

            liste.RemoveAll(o => o.Id == ordre.Id);

            // Nettoyer le niveau de prix s'il est vide
            if (liste.Count == 0)
                book.Remove(prix);
        }
    }

    // -----------------------------------------------------------------------
    // Lecture (retournent null si le book est vide)
    // -----------------------------------------------------------------------

    public Ordre? MeilleurBid()
    {
        lock (_lock)
        {
            foreach (var niveau in _bids)
                if (niveau.Value.Count > 0)
                    return niveau.Value[0]; // Price-Time : premier arrivé
            return null;
        }
    }

    public Ordre? MeilleurAsk()
    {
        lock (_lock)
        {
            foreach (var niveau in _asks)
                if (niveau.Value.Count > 0)
                    return niveau.Value[0];
            return null;
        }
    }

    public decimal Spread()
    {
        lock (_lock)
        {
            var bid = MeilleurBid();
            var ask = MeilleurAsk();

            if (bid == null || ask == null)
                return 0;

            var prixBid = bid.PrixLimite ?? decimal.MaxValue;
            var prixAsk = ask.PrixLimite ?? decimal.MinValue;

            return prixAsk - prixBid;
        }
    }

    // Copies défensives → personne ne peut modifier le book interne
    // depuis l'extérieur via ces listes
    public List<Ordre> GetBids()
    {
        lock (_lock)
            return _bids.Values.SelectMany(liste => liste).ToList();
    }

    public List<Ordre> GetAsks()
    {
        lock (_lock)
            return _asks.Values.SelectMany(liste => liste).ToList();
    }
}