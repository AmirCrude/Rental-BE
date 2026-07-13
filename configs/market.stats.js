// Market statistics for fraud detection
// Generated from training data - loaded into memory at startup

const MARKET_STATS = {
    "Apartment Building_budget": {
      "mean_price_per_sqm": 504.18119750951485,
      "std_price_per_sqm": 311.71338333086226
    },
    "Apartment Building_high_end": {
      "mean_price_per_sqm": 1625.215550063959,
      "std_price_per_sqm": 952.358272704186
    },
    "Apartment Building_mid": {
      "mean_price_per_sqm": 859.4760505314364,
      "std_price_per_sqm": 482.1089784105892
    },
    "Condominium_budget": {
      "mean_price_per_sqm": 351.096341289929,
      "std_price_per_sqm": 203.81394217374066
    },
    "Condominium_high_end": {
      "mean_price_per_sqm": 755.3014704073281,
      "std_price_per_sqm": 448.2406936038371
    },
    "Condominium_mid": {
      "mean_price_per_sqm": 536.5309163770658,
      "std_price_per_sqm": 316.74079816866544
    },
    "Townhouse_budget": {
      "mean_price_per_sqm": 625.9625130377705,
      "std_price_per_sqm": 473.0986409385926
    },
    "Townhouse_high_end": {
      "mean_price_per_sqm": 1492.2582986617033,
      "std_price_per_sqm": 1100.1802417596598
    },
    "Townhouse_mid": {
      "mean_price_per_sqm": 919.2536119511581,
      "std_price_per_sqm": 646.4104994316134
    },
    "Villa Compound_budget": {
      "mean_price_per_sqm": 335.230246247326,
      "std_price_per_sqm": 168.90446117915837
    },
    "Villa Compound_high_end": {
      "mean_price_per_sqm": 913.2042759213946,
      "std_price_per_sqm": 489.98519666100583
    },
    "Villa Compound_mid": {
      "mean_price_per_sqm": 532.8089081707174,
      "std_price_per_sqm": 275.62780053221604
    }
  };
  
  // Area tier mapping
  const AREA_TIERS = {
    high_end: [
      "Bole", "Bole Michael", "Hayahulet", "Bole Medhane Alem",
      "Urael", "Atlas", "Kazanchis", "Sarbet", "Bisrate Gebriel",
      "Yeka", "Gerji", "Betel"
    ],
    mid: [
      "CMC", "Megenagna", "Summit", "Ayat", "Wollo Sefer", "Lebu",
      "Jemo", "Gulele", "Lemi Kura", "Mekanisa", "Gurd Shola",
      "Lideta", "Piassa", "Gotera", "Kotebe", "Shola", "Lamberet",
      "Ayer Tena", "Adisu Gebeya", "Kera"
    ],
    budget: [
      "Kolfe Keranio", "Akaki Kality", "Gofa", "Nifas Silk Lafto",
      "Shiro Meda", "Entoto", "Koye Feche", "Saris", "Bole Bulbula",
      "Addis Ketema", "Lafto", "Saris Abo", "Kirkos"
    ]
  };
  
  const TIER_ENCODED = { budget: 1, mid: 2, high_end: 3 };
  
  module.exports = { MARKET_STATS, AREA_TIERS, TIER_ENCODED };