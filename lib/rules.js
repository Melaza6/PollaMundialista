export const ENTRY_COP = 2000;
export const ENTRY_USD_CENTS = 100;
export const DEFAULT_USD_COP_RECEIVED = 4000;
export const LOCK_MINUTES = 15;
export const ADMIN_CORRECTION_LOCK_MINUTES = 5;

export function scorePrediction(prediction, result) {
  if (!result || result.status !== "FINAL") return null;
  if (prediction.homeScore === result.homeScore && prediction.awayScore === result.awayScore) return 5;

  const actual = matchOutcome(result.homeScore, result.awayScore);
  const picked = matchOutcome(prediction.homeScore, prediction.awayScore);
  return actual === picked ? 2 : 0;
}

export function matchOutcome(homeScore, awayScore) {
  if (homeScore > awayScore) return "HOME";
  if (homeScore < awayScore) return "AWAY";
  return "DRAW";
}

export function isPredictionLocked(match, now = new Date()) {
  if (!match?.kickoffAt) return true;
  const lockAt = new Date(new Date(match.kickoffAt).getTime() - LOCK_MINUTES * 60 * 1000);
  return now >= lockAt;
}

export function predictionLockInfo(match, now = new Date()) {
  const lockAt = new Date(new Date(match.kickoffAt).getTime() - LOCK_MINUTES * 60 * 1000);
  return {
    locked: isPredictionLocked(match, now),
    lockAt: lockAt.toISOString(),
  };
}

export function isAdminCorrectionLocked(match, now = new Date()) {
  if (!match?.kickoffAt) return true;
  const lockAt = new Date(new Date(match.kickoffAt).getTime() - ADMIN_CORRECTION_LOCK_MINUTES * 60 * 1000);
  return now >= lockAt;
}

export function adminCorrectionLockInfo(match, now = new Date()) {
  const lockAt = new Date(new Date(match.kickoffAt).getTime() - ADMIN_CORRECTION_LOCK_MINUTES * 60 * 1000);
  return {
    locked: isAdminCorrectionLocked(match, now),
    lockAt: lockAt.toISOString(),
  };
}

export function getNextMatches(matches, count = 3, now = new Date()) {
  return matches
    .filter((match) => new Date(match.kickoffAt) > now && match.status !== "FINISHED" && match.result?.status !== "FINAL")
    .sort((a, b) => new Date(a.kickoffAt) - new Date(b.kickoffAt))
    .slice(0, count);
}

export function getMatchesInNextDays(matches, days = 3, now = new Date()) {
  const start = now.getTime();
  const end = start + days * 24 * 60 * 60 * 1000;
  return matches
    .filter((match) => {
      const kickoff = new Date(match.kickoffAt).getTime();
      return kickoff >= start && kickoff <= end;
    })
    .sort((a, b) => new Date(a.kickoffAt) - new Date(b.kickoffAt));
}

export function canEditPrediction({ currentUser, prediction, match, now = new Date() }) {
  if (!currentUser) return false;
  if (!prediction) return !isPredictionLocked(match, now);
  return prediction.userId === currentUser.id && !isPredictionLocked(match, now);
}

export function assertUserCanPredict({ currentUser, existingPrediction, match, now = new Date() }) {
  if (!currentUser) {
    return { ok: false, reason: "LOGIN_REQUIRED" };
  }
  if (isPredictionLocked(match, now)) {
    return { ok: false, reason: "PREDICTION_LOCKED" };
  }
  if (existingPrediction && existingPrediction.userId !== currentUser.id) {
    return { ok: false, reason: "NOT_OWNER" };
  }
  return { ok: true };
}

export function calculatePaymentMoney(currency, receivedCop = DEFAULT_USD_COP_RECEIVED) {
  if (currency === "USD") {
    const actualCop = Number(receivedCop);
    return {
      currency: "USD",
      amountMinor: ENTRY_USD_CENTS,
      baseContributionCop: ENTRY_COP,
      basePotContributionCop: ENTRY_COP,
      copEquivalent: actualCop,
      actualCopReceived: actualCop,
      excessContributionCop: Math.max(actualCop - ENTRY_COP, 0),
      exchangeExcess: Math.max(actualCop - ENTRY_COP, 0),
    };
  }

  return {
    currency: "COP",
    amountMinor: ENTRY_COP,
    baseContributionCop: ENTRY_COP,
    basePotContributionCop: ENTRY_COP,
    copEquivalent: ENTRY_COP,
    actualCopReceived: ENTRY_COP,
    excessContributionCop: 0,
    exchangeExcess: 0,
  };
}

export function paymentBaseContribution(payment) {
  return Number(payment?.basePotContributionCop ?? payment?.baseContributionCop ?? 0);
}

export function paymentExchangeExcess(payment) {
  if (payment?.currency !== "USD") return 0;
  const explicit = Number(payment?.exchangeExcess ?? payment?.excessContributionCop ?? 0);
  const actual = paymentActualCop(payment);
  return Math.max(explicit, actual - ENTRY_COP, 0);
}

export function paymentActualCop(payment) {
  return Number(payment?.actualCopReceived ?? payment?.copEquivalent ?? 0);
}

export function calculateMatchSettlement(match, predictions, payments) {
  const matchPredictions = predictions.filter((prediction) => prediction.matchId === match.id);
  const verifiedPayments = payments.filter(
    (payment) => payment.matchId === match.id && payment.verificationStatus === "VERIFIED",
  );
  const paidPredictionIds = new Set(verifiedPayments.map((payment) => payment.predictionId));
  const paidPredictions = matchPredictions.filter((prediction) => paidPredictionIds.has(prediction.id));
  const scoredPredictions = paidPredictions.map((prediction) => ({
    ...prediction,
    points: scorePrediction(prediction, match.result),
  }));
  const scoreable = scoredPredictions.filter((prediction) => prediction.points !== null);
  const topScore = scoreable.length ? Math.max(...scoreable.map((prediction) => prediction.points)) : null;
  const winners = topScore === null ? [] : scoreable.filter((prediction) => prediction.points === topScore);
  const basePotCop = verifiedPayments.reduce((sum, payment) => sum + paymentBaseContribution(payment), 0);
  const usdExcessCop = verifiedPayments.reduce((sum, payment) => sum + paymentExchangeExcess(payment), 0);
  const basePayoutEachCop = winners.length ? Math.floor(basePotCop / winners.length) : 0;

  return {
    matchId: match.id,
    paidCount: verifiedPayments.length,
    basePotCop,
    usdExcessCop,
    topScore,
    winners: winners.map((prediction) => ({
      userId: prediction.userId,
      predictionId: prediction.id,
      points: prediction.points,
      basePayoutCop: basePayoutEachCop,
      bonusPayoutCop: 0,
      totalPayoutCop: basePayoutEachCop,
    })),
  };
}

export function calculatePrizeSummary({ predictions, payments }) {
  const verified = payments.filter((payment) => payment.verificationStatus === "VERIFIED");
  const pending = payments.filter((payment) => payment.verificationStatus !== "VERIFIED");
  const rejected = payments.filter((payment) => payment.verificationStatus === "REJECTED");
  const verifiedCop = verified.filter((payment) => payment.currency !== "USD");
  const verifiedUsd = verified.filter((payment) => payment.currency === "USD");
  return {
    totalCollectedCop: verified.reduce((sum, payment) => sum + paymentActualCop(payment), 0),
    totalPendingCop: pending.reduce((sum, payment) => sum + paymentActualCop(payment), 0),
    totalVerifiedCop: verified.reduce((sum, payment) => sum + paymentActualCop(payment), 0),
    verifiedCopPaymentsCop: verifiedCop.reduce((sum, payment) => sum + paymentActualCop(payment), 0),
    verifiedUsdPayments: verifiedUsd.length,
    verifiedCopPayments: verifiedCop.length,
    totalActualCopFromUsd: verifiedUsd.reduce((sum, payment) => sum + paymentActualCop(payment), 0),
    basePotCop: verified.reduce((sum, payment) => sum + paymentBaseContribution(payment), 0),
    usdExchangeExcessCop: verified.reduce((sum, payment) => sum + paymentExchangeExcess(payment), 0),
    rejectedEntries: rejected.length,
    verifiedEntries: verified.length,
    pendingEntries: pending.length,
    submittedPredictions: predictions.length,
  };
}

export function calculateStandings(users, matches, predictions, payments) {
  const verifiedPredictionIds = new Set(
    payments.filter((payment) => payment.verificationStatus === "VERIFIED").map((payment) => payment.predictionId),
  );
  const resultByMatch = new Map(matches.map((match) => [match.id, match.result]));
  const rows = users
    .filter((user) => user.role === "USER")
    .map((user) => {
      const userPredictions = predictions.filter((prediction) => prediction.userId === user.id);
      const paidPredictions = userPredictions.filter((prediction) => verifiedPredictionIds.has(prediction.id));
      const scored = paidPredictions
        .map((prediction) => scorePrediction(prediction, resultByMatch.get(prediction.matchId)))
        .filter((points) => points !== null);
      const exact = scored.filter((points) => points === 5).length;
      const correctResult = scored.filter((points) => points === 2).length;
      return {
        userId: user.id,
        name: user.name,
        points: scored.reduce((sum, points) => sum + points, 0),
        predictionsSubmitted: userPredictions.length,
        paidPredictions: paidPredictions.length,
        correctPredictions: exact,
        correctResult,
      };
    })
    .sort((a, b) => b.points - a.points || b.correctPredictions - a.correctPredictions || a.name.localeCompare(b.name));

  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

export function calculateTournamentBonus(users, matches, predictions, payments) {
  const standings = calculateStandings(users, matches, predictions, payments);
  const bonusPotCop = payments
    .filter((payment) => payment.verificationStatus === "VERIFIED")
    .reduce((sum, payment) => sum + paymentExchangeExcess(payment), 0);
  const maxCorrect = standings[0]?.correctPredictions || 0;
  const winners = maxCorrect ? standings.filter((row) => row.correctPredictions === maxCorrect) : [];
  const bonusPayoutEachCop = winners.length ? Math.floor(bonusPotCop / winners.length) : 0;

  return {
    bonusPotCop,
    mostCorrectPredictions: maxCorrect,
    winners: winners.map((winner) => ({ ...winner, bonusPayoutCop: bonusPayoutEachCop })),
  };
}

export function calculatePayoutLedger(users, matches, predictions, payments, existingPayouts = [], now = new Date()) {
  const records = [];
  const existingByKey = new Map(existingPayouts.map((payout) => [`${payout.source}:${payout.userId}:${payout.prizeType}`, payout]));
  for (const match of matches.filter((item) => item.result?.status === "FINAL")) {
    const settlement = calculateMatchSettlement(match, predictions, payments);
    for (const winner of settlement.winners) {
      const key = `match:${match.id}:${winner.userId}:match_winner`;
      const existing = existingByKey.get(key);
      records.push({
        id: existing?.id || `payout_${match.id}_${winner.userId}_match`,
        userId: winner.userId,
        prizeType: "match_winner",
        amountCop: winner.basePayoutCop,
        amountUsd: 0,
        source: `match:${match.id}`,
        status: existing?.status || "calculated",
        adminNotes: existing?.adminNotes || "",
        calculatedAt: existing?.calculatedAt || now.toISOString(),
        approvedBy: existing?.approvedBy || null,
        approvedAt: existing?.approvedAt || null,
        paidBy: existing?.paidBy || null,
        paidAt: existing?.paidAt || null,
      });
    }
  }

  const bonus = calculateTournamentBonus(users, matches, predictions, payments);
  for (const winner of bonus.winners) {
    const existing = existingByKey.get(`world_cup_bonus:${winner.userId}:world_cup_bonus`);
    records.push({
      id: existing?.id || `payout_bonus_${winner.userId}`,
      userId: winner.userId,
      prizeType: "world_cup_bonus",
      amountCop: winner.bonusPayoutCop,
      amountUsd: 0,
      source: "world_cup_bonus",
      status: existing?.status || "calculated",
      adminNotes: existing?.adminNotes || "",
      calculatedAt: existing?.calculatedAt || now.toISOString(),
      approvedBy: existing?.approvedBy || null,
      approvedAt: existing?.approvedAt || null,
      paidBy: existing?.paidBy || null,
      paidAt: existing?.paidAt || null,
    });
  }
  return records.filter((record) => record.amountCop > 0 || record.amountUsd > 0);
}

export function canUseAdminAction(currentUser) {
  return currentUser?.role === "ADMIN";
}

export function generateWinnerMessage({ language = "es", match, settlement, users, standings }) {
  if (!match.result || match.result.status !== "FINAL") {
    return language === "es"
      ? "El resultado oficial aun no esta disponible."
      : "The official result is not available yet.";
  }

  const userById = new Map(users.map((user) => [user.id, user]));
  const winnerNames = settlement.winners.map((winner) => userById.get(winner.userId)?.name || "Unknown");
  const leaders = standings.filter((row) => row.rank === 1).map((row) => `${row.name} (${row.points})`);
  const score = `${match.homeTeam} ${match.result.homeScore} - ${match.result.awayScore} ${match.awayTeam}`;

  if (language === "en") {
    return [
      `Final result: ${score}.`,
      "",
      "Prediction winner(s):",
      winnerNames.length ? `${winnerNames.join(", ")} won this round.` : "No verified winner yet.",
      "",
      `Current leader: ${leaders.join(", ") || "Pending"}.`,
      "Stay tuned for the next Polla Mundialista 2026 matches.",
    ].join("\n");
  }

  return [
    `Resultado final: ${score}.`,
    "",
    "Ganador(es) de la prediccion:",
    winnerNames.length ? `${winnerNames.join(", ")} gana esta ronda.` : "Aun no hay ganador verificado.",
    "",
    `Lider actual: ${leaders.join(", ") || "Pendiente"}.`,
    "Sigue pendiente de los proximos partidos de la Polla Mundialista 2026.",
  ].join("\n");
}

export function syncApiResult(match, now = new Date()) {
  if (!match.apiResult) {
    return {
      ...match,
      resultSync: {
        source: match.resultSync?.source || "mock-results-api",
        status: "PENDING",
        lastSyncedAt: now.toISOString(),
        message: "No official result available yet",
      },
    };
  }

  return {
    ...match,
    status: "FINISHED",
    result: {
      status: "FINAL",
      homeScore: match.apiResult.homeScore,
      awayScore: match.apiResult.awayScore,
      source: "mock-results-api",
      syncedAt: now.toISOString(),
    },
    resultSync: {
      source: "mock-results-api",
      status: "SYNCED",
      lastSyncedAt: now.toISOString(),
      message: "Official result synced",
    },
  };
}
