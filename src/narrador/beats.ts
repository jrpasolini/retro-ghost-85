import { beats } from "../data/beats.ts";
import { beatsEn } from "../data/beats-en.ts";
import { casas } from "../data/casas.ts";
import { localizarCasa, type Idioma } from "../i18n/content.ts";
import type { EntradaLog } from "../motor/log.ts";

export type BeatCandidate = { id: number; tipo?: string; magnitude?: number };
export type NarrationBeat = BeatCandidate & { titulo: string; beat: string };
export const MAX_BEATS_ACT = 2;
export const MAX_BEATS_ENDGAME = 5;

/** Preserve chronology, avoid repeating a house, reserve the final landing. */
export function selectNarrationBeats<T extends BeatCandidate>(candidates: readonly T[], endgame = false): T[] {
  const unique = candidates.filter((s, i) => !candidates.slice(i + 1).some(other => other.id === s.id));
  const limit = endgame ? MAX_BEATS_ENDGAME : MAX_BEATS_ACT;
  if (unique.length <= limit) return unique.slice();
  const chosen = new Set<number>([unique.length - 1]);
  if (endgame) chosen.add(0);
  const ranked = unique.map((s, i) => ({ i, score: (s.tipo === "fatalidade" ? 30 : s.tipo === "marco" ? 20 : 10) + Math.abs(s.magnitude ?? 0) }))
    .sort((a, b) => b.score - a.score || a.i - b.i);
  for (const { i } of ranked) {
    if (chosen.size >= limit) break;
    chosen.add(i);
  }
  return [...chosen].sort((a, b) => a - b).map(i => unique[i]);
}

export function localizeNarrationBeats(candidates: readonly BeatCandidate[], lang: string): NarrationBeat[] {
  const idioma: Idioma = lang === "en" || lang === "en-US" ? "en-US" : "pt-BR";
  return candidates.filter(s => Number.isInteger(s.id) && s.id >= 1 && s.id <= 40).map(s => {
    const casa = casas[s.id - 1];
    return { id: s.id, tipo: casa.tipo, magnitude: Math.abs(casa.consequencia.projeto ?? 0),
      titulo: localizarCasa(casa, idioma).titulo, beat: (idioma === "en-US" ? beatsEn : beats)[s.id] };
  });
}

/** Only this player's actual landings, never passed squares or skipped turns. */
export function prepareNarrationBeats(log: readonly EntradaLog[], jogadorId: number, lang: string, endgame = false): NarrationBeat[] {
  const landings = log.filter(e => e.jogadorId === jogadorId && (e.turno === 0 || e.dado1 !== null))
    .flatMap(e => e.turno === 0 ? [{ id: 1 }] : e.casaDestino === e.casaFinal ? [{ id: e.casaDestino }] : [{ id: e.casaDestino }, { id: e.casaFinal }]);
  return selectNarrationBeats(localizeNarrationBeats(landings, lang), endgame);
}
