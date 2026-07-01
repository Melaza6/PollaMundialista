export const SPANISH_TEAM_NAMES = Object.freeze({
  "United States": "Estados Unidos",
  Germany: "Alemania",
  "Ivory Coast": "Costa de Marfil",
  Netherlands: "Paises Bajos",
  "South Korea": "Corea del Sur",
  "DR Congo": "RD Congo",
  "Bosnia and Herzegovina": "Bosnia y Herzegovina",
  Switzerland: "Suiza",
  Sweden: "Suecia",
  England: "Inglaterra",
  Morocco: "Marruecos",
  Japan: "Japon",
  France: "Francia",
  Spain: "Espana",
  Belgium: "Belgica",
  Brazil: "Brasil",
  "South Africa": "Sudafrica",
  Qatar: "Catar",
  Scotland: "Escocia",
  Turkey: "Turquia",
  Tunisia: "Tunez",
  Iran: "Iran",
  "New Zealand": "Nueva Zelanda",
  "Saudi Arabia": "Arabia Saudita",
  Iraq: "Irak",
  Uzbekistan: "Uzbekistan",
  Panama: "Panama",
  Mexico: "Mexico",
  Canada: "Canada",
  Ecuador: "Ecuador",
  Austria: "Austria",
  Algeria: "Argelia",
  Australia: "Australia",
  Egypt: "Egipto",
  "Cape Verde": "Cabo Verde",
  Norway: "Noruega",
  Paraguay: "Paraguay",
  Czechia: "Chequia",
  Haiti: "Haiti",
  Curacao: "Curazao",
  Uruguay: "Uruguay",
  Jordan: "Jordania",
  Portugal: "Portugal",
  Croatia: "Croacia",
  Colombia: "Colombia",
  Ghana: "Ghana",
  Argentina: "Argentina",
  Senegal: "Senegal",
});

export function displayTeamName(name, language = "en") {
  const rawName = String(name || "");
  if (language !== "es") return rawName;
  return SPANISH_TEAM_NAMES[rawName.trim()] || rawName;
}

export function displayMatchName(match, language = "en") {
  if (!match) return "";
  return `${displayTeamName(match.homeTeam, language)} vs ${displayTeamName(match.awayTeam, language)}`;
}
