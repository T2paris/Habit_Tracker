import starterImg from "../imgs/avatars/starter_scout.png";
import focusMonkImg from "../imgs/avatars/focus_monk.png";
import streetRunnerImg from "../imgs/avatars/street_runner.png";
import spartanGhostImg from "../imgs/avatars/spartan_ghost.png";
import cyberVigilanteImg from "../imgs/avatars/cyber_vigilante.png";
import shadowAssassinImg from "../imgs/avatars/shadow_assassin.png";
import blazeDuelistImg from "../imgs/avatars/blaze_duelist.png";
import titanBerserkerImg from "../imgs/avatars/titan_berserker.png";
import neonSamuraiImg from "../imgs/avatars/neon_samurai.png";
import godOfDisciplineImg from "../imgs/avatars/god_discipline.png";
import voidKingImg from "../imgs/avatars/void_king.png";
import ascendedHeroImg from "../imgs/avatars/ascended_hero.png";
import habitLegendImg from "../imgs/avatars/habit_legend.png";

/**
 * Lista base de avatares (imutável)
 */
export const AVATARS = Object.freeze([
  { id: "starter_scout", name: "Starter Scout", title: "Starter Scout", price: 0, img: starterImg },
  { id: "focus_monk", name: "Focus Monk", title: "Focus Monk", price: 30, img: focusMonkImg },
  { id: "street_runner", name: "Street Runner", title: "Street Runner", price: 50, img: streetRunnerImg },
  { id: "spartan_ghost", name: "Spartan Ghost", title: "Spartan Ghost", price: 120, img: spartanGhostImg },
  { id: "cyber_vigilante", name: "Cyber Vigilante", title: "Cyber Vigilante", price: 150, img: cyberVigilanteImg },
  { id: "shadow_assassin", name: "Shadow Assassin", title: "Shadow Assassin", price: 150, img: shadowAssassinImg },
  { id: "blaze_duelist", name: "Blaze Duelist", title: "Blaze Duelist", price: 250, img: blazeDuelistImg },
  { id: "titan_berserker", name: "Titan Berserker", title: "Titan Berserker", price: 300, img: titanBerserkerImg },
  { id: "neon_samurai", name: "Neon Samurai", title: "Neon Samurai", price: 300, img: neonSamuraiImg },
  { id: "habit_legend", name: "Habit Legend", title: "Habit Legend", price: 450, img: habitLegendImg },
  { id: "void_king", name: "Void King", title: "Void King", price: 600, img: voidKingImg },
  { id: "ascended_hero", name: "Ascended Hero", title: "Ascended Hero", price: 600, img: ascendedHeroImg },
  { id: "god_discipline", name: "God of Discipline", title: "God of Discipline", price: 800, img: godOfDisciplineImg },
]);

/**
 * Mapa por ID para acesso rápido
 */
export const AVATAR_MAP = Object.freeze(
  Object.fromEntries(AVATARS.map((a) => [a.id, a]))
);

/**
 * Retorna avatar por ID
 * - fallback seguro para starter
 */
export function avatarById(id) {
  return AVATAR_MAP[id] || AVATAR_MAP["starter_scout"];
}
