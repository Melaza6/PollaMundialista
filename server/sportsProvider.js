import { getNextMatches } from "../lib/rules.js";

const API_FOOTBALL = "api-football";
const FOOTBALL_DATA = "football-data";
const PENDING_MESSAGE = "Pending sync";

function isoNow() {
  return new Date().toISOString();
}

function configuredProviders(env) {
  const apiFootballKey = env.API_FOOTBALL_KEY || (env.FOOTBALL_API_PROVIDER === API_FOOTBALL ? env.FOOTBALL_API_KEY : "");
  const footballDataKey =
    env.FOOTBALL_DATA_API_KEY || (env.FOOTBALL_API_PROVIDER === FOOTBALL_DATA ? env.FOOTBALL_API_KEY : "");
  const preferred = env.FOOTBALL_API_PROVIDER || "auto";
  const providers = [];

  if (preferred === FOOTBALL_DATA) {
    if (footballDataKey) providers.push({ name: FOOTBALL_DATA, key: footballDataKey });
    if (apiFootballKey) providers.push({ name: API_FOOTBALL, key: apiFootballKey });
    return providers;
  }

  if (preferred === API_FOOTBALL || preferred === "auto") {
    if (apiFootballKey) providers.push({ name: API_FOOTBALL, key: apiFootballKey });
    if (footballDataKey) providers.push({ name: FOOTBALL_DATA, key: footballDataKey });
    return providers;
  }

  if (apiFootballKey) providers.push({ name: API_FOOTBALL, key: apiFootballKey });
  if (footballDataKey) providers.push({ name: FOOTBALL_DATA, key: footballDataKey });
  return providers;
}

function baseSyncStatus(overrides = {}) {
  return {
    provider: overrides.provider || "not-configured",
    status: overrides.status || "PENDING",
    lastSyncedAt: overrides.lastSyncedAt || null,
    fixturesLastSyncedAt: overrides.fixturesLastSyncedAt || null,
    resultsLastSyncedAt: overrides.resultsLastSyncedAt || null,
    fixturesPulled: overrides.fixturesPulled || 0,
    resultsPulled: overrides.resultsPulled || 0,
    resultsChecked: overrides.resultsChecked || 0,
    competitionName: overrides.competitionName || null,
    season: overrides.season || null,
    message: overrides.message || PENDING_MESSAGE,
    error: overrides.error || null,
  };
}

function providerMessage(provider) {
  if (provider === API_FOOTBALL) return "Synced from API-Football";
  if (provider === FOOTBALL_DATA) return "Synced from football-data.org";
  return PENDING_MESSAGE;
}

function resultSync(provider, status = "SYNCED", at = isoNow(), message = providerMessage(provider)) {
  return {
    source: provider,
    status,
    lastSyncedAt: at,
    message,
  };
}

function finalResult(provider, homeScore, awayScore, at = isoNow()) {
  return {
    status: "FINAL",
    homeScore,
    awayScore,
    source: provider,
    syncedAt: at,
  };
}

function normalizeStatus(provider, status) {
  if (provider === FOOTBALL_DATA) {
    if (status === "FINISHED") return "FINISHED";
    if (status === "IN_PLAY" || status === "PAUSED") return "LIVE";
    return "SCHEDULED";
  }

  if (["FT", "AET", "PEN"].includes(status)) return "FINISHED";
  if (["1H", "HT", "2H", "ET", "BT", "P"].includes(status)) return "LIVE";
  return "SCHEDULED";
}

function normalizeApiFootballFixture(item, syncedAt) {
  const provider = API_FOOTBALL;
  const homeScore = item.goals?.home;
  const awayScore = item.goals?.away;
  const finished = normalizeStatus(provider, item.fixture?.status?.short) === "FINISHED";

  return {
    id: `apif_${item.fixture.id}`,
    homeTeam: item.teams?.home?.name || "TBD",
    awayTeam: item.teams?.away?.name || "TBD",
    kickoffAt: item.fixture?.date,
    venue: item.fixture?.venue?.name || "TBD",
    stage: item.league?.round || "",
    group: item.league?.round || "",
    competitionName: item.league?.name || "FIFA World Cup",
    season: String(item.league?.season || "2026"),
    status: normalizeStatus(provider, item.fixture?.status?.short),
    apiResult: homeScore !== null && awayScore !== null ? { homeScore, awayScore } : null,
    result: finished && homeScore !== null && awayScore !== null ? finalResult(provider, homeScore, awayScore, syncedAt) : null,
    resultSync: resultSync(provider, "SYNCED", syncedAt),
  };
}

function normalizeFootballDataMatch(match, syncedAt) {
  const provider = FOOTBALL_DATA;
  const homeScore = match.score?.fullTime?.home;
  const awayScore = match.score?.fullTime?.away;
  const finished = normalizeStatus(provider, match.status) === "FINISHED";
  const season =
    match.season?.year ||
    match.season?.startDate?.slice(0, 4) ||
    match.season?.endDate?.slice(0, 4) ||
    match.season ||
    "2026";

  return {
    id: `fd_${match.id}`,
    homeTeam: match.homeTeam?.name || "TBD",
    awayTeam: match.awayTeam?.name || "TBD",
    kickoffAt: match.utcDate,
    venue: match.venue || "TBD",
    stage: match.stage || match.group || "",
    group: match.group || "",
    competitionName: match.competition?.name || "FIFA World Cup",
    season: String(season),
    status: normalizeStatus(provider, match.status),
    apiResult: homeScore !== null && awayScore !== null ? { homeScore, awayScore } : null,
    result: finished && homeScore !== null && awayScore !== null ? finalResult(provider, homeScore, awayScore, syncedAt) : null,
    resultSync: resultSync(provider, "SYNCED", syncedAt),
  };
}

function markPending(match, provider = match?.resultSync?.source || "not-configured", message = PENDING_MESSAGE) {
  return {
    ...match,
    resultSync: {
      source: provider,
      status: "PENDING",
      lastSyncedAt: match?.resultSync?.lastSyncedAt || null,
      message,
    },
  };
}

async function fetchApiFootballFixtures({ env, key, from, to, ids }) {
  const search = new URLSearchParams({
    league: env.API_FOOTBALL_WORLD_CUP_LEAGUE_ID || "1",
    season: env.API_FOOTBALL_SEASON || "2026",
  });
  if (from) search.set("from", from);
  if (to) search.set("to", to);
  if (ids?.length) search.set("ids", ids.map((id) => String(id).replace(/^apif_/, "")).join("-"));

  const response = await fetch(`https://v3.football.api-sports.io/fixtures?${search}`, {
    headers: { "x-apisports-key": key },
  });
  if (!response.ok) throw new Error(`API-Football sync failed: ${response.status}`);
  const payload = await response.json();
  if (payload.errors && Object.keys(payload.errors).length) {
    throw new Error(`API-Football error: ${Object.entries(payload.errors).map(([key, value]) => `${key}: ${value}`).join("; ")}`);
  }
  const syncedAt = isoNow();
  return (payload.response || []).map((item) => normalizeApiFootballFixture(item, syncedAt));
}

async function fetchFootballDataMatches({ key, from, to }) {
  const search = new URLSearchParams();
  if (from) search.set("dateFrom", from);
  if (to) search.set("dateTo", to);

  const response = await fetch(`https://api.football-data.org/v4/competitions/WC/matches${search.toString() ? `?${search}` : ""}`, {
    headers: { "X-Auth-Token": key },
  });
  if (!response.ok) throw new Error(`football-data.org sync failed: ${response.status}`);
  const payload = await response.json();
  if (payload.error || payload.message) {
    throw new Error(`football-data.org error: ${payload.error || payload.message}`);
  }
  const syncedAt = isoNow();
  return (payload.matches || []).map((match) =>
    normalizeFootballDataMatch(
      {
        ...match,
        competition: match.competition || payload.competition,
        season: match.season || payload.season,
      },
      syncedAt,
    ),
  );
}

function lastCompleted(matches, count = 3) {
  return matches
    .filter((match) => match.status === "FINISHED" || match.result?.status === "FINAL")
    .sort((a, b) => new Date(b.kickoffAt) - new Date(a.kickoffAt))
    .slice(0, count);
}

export function createSportsProvider(env = process.env) {
  const providers = configuredProviders(env);

  async function fetchFromProviders(options = {}) {
    const errors = [];
    for (const provider of providers) {
      try {
        const matches =
          provider.name === API_FOOTBALL
            ? await fetchApiFootballFixtures({ env, key: provider.key, ...options })
            : await fetchFootballDataMatches({ key: provider.key, ...options });
        return { provider: provider.name, matches };
      } catch (error) {
        errors.push(`${provider.name}: ${error.message}`);
      }
    }

    return {
      provider: providers[0]?.name || "not-configured",
      matches: [],
      error: errors.join("; ") || "No football API provider is configured.",
    };
  }

  async function syncFixtures({ from, to, cachedMatches = [] } = {}) {
    if (!providers.length) {
      return {
        provider: "not-configured",
        matches: cachedMatches,
        status: baseSyncStatus({
          message: "Set API_FOOTBALL_KEY or FOOTBALL_DATA_API_KEY to sync real World Cup fixtures.",
        }),
      };
    }

    const sync = await fetchFromProviders({ from, to });
    const syncedAt = sync.matches.length ? isoNow() : null;
  return {
      ...sync,
      matches: sync.matches.length ? sync.matches : cachedMatches,
      status: baseSyncStatus({
        provider: sync.provider,
        status: sync.matches.length ? "SYNCED" : "PENDING",
        lastSyncedAt: syncedAt,
        fixturesLastSyncedAt: syncedAt,
        fixturesPulled: sync.matches.length,
        competitionName: sync.matches[0]?.competitionName || null,
        season: sync.matches[0]?.season || null,
        error: sync.error || null,
        message: sync.matches.length
          ? `Synced ${sync.matches.length} matches from ${sync.provider}.`
          : sync.error || "No World Cup 2026 matches returned by the provider.",
      }),
    };
  }

  async function syncResults({ matchIds = [], cachedMatches = [] } = {}) {
    const requested = matchIds.length ? cachedMatches.filter((match) => matchIds.includes(match.id)) : lastCompleted(cachedMatches, 3);
    if (!providers.length) {
      const matches = requested.map((match) =>
        markPending(match, match.resultSync?.source || "not-configured", "Pending sync: no sports data provider is configured."),
      );
      return {
        provider: "not-configured",
        matches,
        status: baseSyncStatus({
          message: "Set API_FOOTBALL_KEY or FOOTBALL_DATA_API_KEY to sync official results.",
        }),
      };
    }

    const apiFootballIds = requested.filter((match) => match.id.startsWith("apif_")).map((match) => match.id);
    const sync = await fetchFromProviders({ ids: apiFootballIds });
    const syncById = new Map(sync.matches.map((match) => [match.id, match]));
    const relevantMatches = matchIds.length ? sync.matches : lastCompleted(sync.matches, 3);
    const relevantById = new Map(relevantMatches.map((match) => [match.id, match]));
    const matches = requested.length
      ? requested.map((match) => relevantById.get(match.id) || syncById.get(match.id) || markPending(match, sync.provider))
      : relevantMatches;
    const syncedAt = matches.length ? isoNow() : null;

    return {
      provider: sync.provider,
      matches,
      status: baseSyncStatus({
        provider: sync.provider,
        status: matches.length ? "SYNCED" : "PENDING",
        lastSyncedAt: syncedAt,
        resultsLastSyncedAt: syncedAt,
        resultsPulled: matches.length,
        resultsChecked: 3,
        competitionName: matches[0]?.competitionName || null,
        season: matches[0]?.season || null,
        error: sync.error || null,
        message: matches.length
          ? `Last completed fixtures checked: 3. Results updated: ${matches.length}.`
          : sync.error || "No official results returned by the provider.",
      }),
    };
  }

  function getUpcomingMatches(matches, count = 4, now = new Date()) {
    return getNextMatches(matches, count, now);
  }

  function getMatchResult(matches, matchId) {
    const match = matches.find((item) => item.id === matchId);
    if (!match?.result) return { matchId, result: null, status: "PENDING", message: PENDING_MESSAGE };
    return { matchId, result: match.result, status: "SYNCED", source: match.result.source, lastSyncedAt: match.result.syncedAt };
  }

  function getLastSyncStatus(savedStatus) {
    return baseSyncStatus(savedStatus || { provider: providers[0]?.name || "not-configured" });
  }

  function getVerificationStatus({ matches = [], syncStatus } = {}) {
    const status = getLastSyncStatus(syncStatus);
    const upcoming = getUpcomingMatches(matches, 3);
    const completed = matches.filter((match) => match.result?.status === "FINAL" || match.status === "FINISHED");
    const competitionNames = [...new Set(matches.map((match) => match.competitionName).filter(Boolean))];
    const seasons = [...new Set(matches.map((match) => String(match.season || "")).filter(Boolean))];
    const appearsWorldCup =
      !matches.length ||
      competitionNames.some((name) => /world cup|fifa/i.test(name)) ||
      status.competitionName === null ||
      /world cup|fifa/i.test(status.competitionName);
    const appears2026 = !matches.length || seasons.includes("2026") || status.season === null || String(status.season) === "2026";
    const warnings = [];

    if (!providers.length) warnings.push("Pending sync: no sports API key is configured.");
    if (matches.length && !appearsWorldCup) warnings.push("Provider may be returning the wrong competition.");
    if (matches.length && !appears2026) warnings.push("Provider may be returning the wrong season.");
    if (!matches.length) warnings.push("No World Cup 2026 matches found yet.");

    return {
      activeProvider: status.provider,
      configured: Boolean(providers.length),
      apiKeysConfigured: {
        apiFootball: providers.some((provider) => provider.name === API_FOOTBALL),
        footballData: providers.some((provider) => provider.name === FOOTBALL_DATA),
      },
      status: status.status,
      message: status.message,
      error: status.error,
      lastFixtureSyncAt: status.fixturesLastSyncedAt,
      lastResultSyncAt: status.resultsLastSyncedAt,
      fixturesPulled: status.fixturesPulled || matches.length,
      upcomingFixtures: upcoming.length,
      completedFixtures: completed.length,
      competitionName: status.competitionName || competitionNames[0] || null,
      season: status.season || seasons[0] || null,
      appearsWorldCup2026: appearsWorldCup && appears2026,
      warnings,
      sampleNextGames: upcoming.slice(0, 5).map((match) => ({
        id: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        kickoffAt: match.kickoffAt,
        stage: match.stage || match.group || "",
        competitionName: match.competitionName || null,
        season: match.season || null,
      })),
    };
  }

  return {
    providerName: providers[0]?.name || "not-configured",
    configured: Boolean(providers.length),
    syncFixtures,
    syncResults,
    getUpcomingMatches,
    getMatchResult,
    getLastSyncStatus,
    getVerificationStatus,
  };
}
