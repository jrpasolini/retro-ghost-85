import type { Casa } from "../types.ts";
import { casas } from "../data/casas.ts";
import { atos } from "../data/atos.ts";

export type Idioma = "en-US" | "pt-BR";
export const DEFAULT_LANGUAGE: Idioma = "en-US";
const PREF_KEY = "retro-ghost-85-language";

export function idiomaGuardado(): Idioma {
  try { return localStorage.getItem(PREF_KEY) === "pt-BR" ? "pt-BR" : DEFAULT_LANGUAGE; }
  catch { return DEFAULT_LANGUAGE; }
}
export function guardarIdioma(idioma: Idioma): void {
  try { localStorage.setItem(PREF_KEY, idioma); } catch { /* modo privado: escolha válida nesta sessão */ }
}

type TextoCasa = readonly [titulo: string, narrativa: string];
/** English localization: editorial narrative only. Game rules, geometry and RNG remain canonical. */
export const casasEn: readonly TextoCasa[] = [
  ["The Newsstand Magazine", "At the newsstand, a magazine promises an entire game hidden among hundreds of numbered BASIC lines. Fresh ink clings to its pages. Every line number feels like the clue to a buried treasure. You buy it, hurry home, and discover the first magic of 1985: creating an adventure with your own hands."],
  ["A Working Floppy", "A friend at the computer club offers his disk drive so you can save your code to a floppy disk. The access light blinks. The motor growls. In moments, your work is safe. You have no drive at home yet, and you owe him a favor, but this borrowed copy may rescue a whole night of typing."],
  ["A Listing Error", "The magazine includes a routine for reading joystick commands. You copy the lines, dreaming of the day you can test a borrowed controller. Then you type RUN. BASIC answers with a sharp error, like a crack in the silent room. A comma became a period in the printed listing. The joystick remains a promise while you hunt down the offending character, line by line, and watch the night disappear."],
  ["RUN and the Blue Screen", "RUN. The monitor glows blue. Your first character responds to the keyboard. You almost spill your soda in triumph. The animation is simple, but it moves. This discovery opens a night of experiments—and that dangerous urge to write just five more minutes of code."],
  ["Saving to Cassette", "Bedtime is long past. You connect the recorder, enter the tape-save command, and listen to the hiss that will carry your BASIC onto cassette. You write a name and version on the label and note the tape counter in your notebook. Tomorrow, if fortune allows, the program will return from the past instead of being born anew."],
  ["The Cassette That Will Not Load", "The PLAY key clicks down. Tape turns. The speaker hisses. You enter CLOAD, wait... and nothing happens. A terrible silence settles over the room. After checking the volume and cables, yesterday's recording finally loads. Today's changes are gone. The ghost in this square devoured your work and sends you backward."],
  ["Blank Cassettes", "Afraid that a temperamental CLOAD may erase your progress, you open your little toolkit. Check the cables. Clean the tape head. Test the mechanism. Only then do you prepare a blank cassette, label its version, and record a backup. It loads on the first attempt. This time, careful maintenance triumphs over improvisation."],
  ["A Borrowed Joystick", "A friend arrives carrying a mysterious cardboard box. You expect spare parts. Inside lies a borrowed joystick. Its stiff lever reveals that your hero responds poorly to diagonals, a flaw the keyboard concealed. You fix the input routine and give the game a better chance in your friends' hands."],
  ["Your Friend's Cartridge", "The coffee has gone cold when a friend inserts his favorite cartridge. You spend hours studying its pace, the buttons' response, and the difficulty of each stage. Every match sparks another idea for your prototype. You return home with a notebook full of observations—not a copy of someone else's game—and the resolve to continue."],
  ["Act 2 · BBS", "Your prototype works. It earns smiles—and questions—at the user group. Between suggestions, someone writes a BBS number in your notebook: the promise of a community beyond these walls. Before dialing, you must master floppy disks, memory, sprites, and faster routines. Act 2 opens the door to the wider world—and the dark machinery inside your microcomputer."],
  ["The Floppy Disk Drive", "A new storage device arrives at your workbench: a floppy disk drive, linked to the micro through its interface. Its gray case seems unremarkable, but the sound of reading a disk announces a private revolution. Loading a version no longer means rewinding a cassette to the right spot. You keep your old tapes; no cautious developer trusts a single medium."],
  ["Formatting the Disk", "The new floppy looks ready, but it has not been formatted. With no manual at hand, you telephone a friend from the club. He dictates the steps, and you write them down before touching the keyboard. The disk is prepared, given a test file, and read back for verification. The call cost a few minutes. It saved an entire floppy."],
  ["The DOS Prompt", "At the club, a PC with a hard drive displays the prompt C:\\>. This is MS-DOS. You type DIR, and filenames appear like secrets kept inside the machine. Your BASIC micro waits at home; here you learn another way to organize programs, versions, and copies. In 1985, two worlds of commands could share one desk."],
  ["The Assembler", "BASIC has served you faithfully, but part of the animation crawls like a weary monster. You dare to write a small machine-language routine for the 8-bit processor, checking addresses and instructions against the open manual. When the screen comes alive, it feels as though the microcomputer has drawn a new breath."],
  ["A Misplaced Sprite", "Your hero belongs in the center of the scene. Instead, it clings to the edge, as though some unseen force dragged it there. No haunting: a wrong value in the coordinate table sent the sprite astray. You retrace your drawing map and spend precious hours bringing the adventurer home."],
  ["Memory Map and VRAM", "You open your developer's toolkit: a technical manual, a memory map, and a hand-scribbled table of addresses. The fault is not in the artwork. Graphic data went to the wrong VRAM address. You repair the routine. The strange characters vanish, and the scene obeys again. Sometimes the most valuable tool is a precise note."],
  ["A Collision That Never Happens", "The integrated circuit follows every instruction without hesitation—even the wrong ones. Your hero passes straight through an enemy. Nothing happens. The bug is not a broken chip but a collision routine comparing coordinates in the wrong order. You cancel the demonstration, circle the conditions in red, and surrender a turn to your own code."],
  ["Music on the PSG", "Time slips away while you adjust each note's pauses and durations. On the micro's PSG, you test frequencies and intervals until three modest voices form an opening theme. After many attempts, the melody accompanies the game without disrupting its animation. The imaginary hourglass can rest. Every second was worth it."],
  ["The Scrolling Bug", "The scenery should glide. Instead, a strip of old tiles remains on the screen like a shadow clinging to the monitor. Software scrolling redraws pieces of the image, but the VRAM update order has failed. You return to your rough routine and banish the fault, tile by tile."],
  ["Act 3 · DEBUG", "Your demonstration impressed your friends, but the notebook came back full of faults: a misplaced sprite, a failed collision, a screen that will not refresh. Every bug now feels like a little ghost hiding in a BASIC condition or a wrong address. You resume testing with the group and prepare to connect to the BBS. Debugging also means listening to players—and distrusting code that once seemed flawless."],
  ["A Borrowed Modem", "The user group celebrates your demonstration as a modest triumph. The prize is not a metal cup, but something far more useful: a friend lends you a modem for a few days. When you connect it to the telephone line, the metallic noises sound like signals from another world. At last, help may come from beyond your neighborhood."],
  ["Dialing the BBS", "You dial the number in your notebook and wait for the modem's unmistakable shriek. The BBS answers. Lines of text appear slowly, as though traveling miles of wire to reach your monitor. Among messages from other programmers, a tip reveals how to save memory in a difficult routine. You copy it down before disconnecting. The telephone line will not free itself."],
  ["The Busy Line", "The modem is ready. So is the communication program. But your plan grinds to a halt when the telephone returns a busy signal. You try again; the BBS remains unreachable. That night, the answer you need waits beyond an endless tone. Cut off from the messages, you lose a turn of progress."],
  ["The User Group", "Around a blinking terminal, the user group gathers to test your demonstration. One person tries an unexpected command; another finds a path that should not exist; someone writes down every flaw. For a moment, the criticism stings. Then it becomes a map of repairs. Your program has escaped the solitude of the workbench."],
  ["A Truncated Listing", "The photocopy contains everything you need—until the last line, sliced away by the copier. The routine ends halfway through a command, like a message cut short in a horror film. You track down the original magazine and reconstruct the missing fragment before using the idea in your program."],
  ["An Authorized Copy", "It is time to show your demonstration to others. You carefully separate your own code from the commercial software you studied while learning. The demonstration floppy carries only what you have the right to distribute, clearly named and documented. A clean copy is worth more than any dubious shortcut."],
  ["Disk Read Error", "The drive tries to read the same track, again and again. The mechanism makes an unfamiliar sound and returns an error. For a moment, you imagine every late night of work disappearing into that plastic circle. Your backup finally responds, but the latest changes must be rebuilt. This square has the sound of panic: a failing floppy."],
  ["The Specialist Magazine", "The issue's star article explains how to remove repeated BASIC code and save memory. You recognize one of its examples: a routine you scattered throughout your project without noticing. You reorganize it. The program becomes smaller and easier to debug. Nothing explodes on screen, but there is a quiet brilliance in code that finally makes sense."],
  ["The Programming Contest", "A magazine announces a contest for readers' programs. Suddenly, your game might reach people who have never seen your desk. You prepare a demonstration, write readable instructions, and label the disk carefully. When you leave the envelope at the post office, it feels as though the adventure has finally left home."],
  ["Act 4 · FINAL", "A letter arrives in the mail with a real possibility: your game may appear in a catalog. Joy lasts only until you see the list of tasks. Test the controls. Prepare the master disk. Print instructions. Make copies. Check every label. The final act demands more than a good idea; it demands enough care for the adventure to work far from your desk."],
  ["Testing the Controls", "Now you must test the joystick with someone who knows none of the commands. Your visitor tries to advance and gets stuck in the first stage. The fault is not theirs. An instruction obvious to its programmer is a riddle to everyone else. You simplify the controls and spare a future player the frustration."],
  ["The Jammed Printer", "The dot-matrix printer rattles at full speed until continuous-feed paper catches in the tractor. The print head keeps striking a crooked sheet. Ink and letters pile up like a plea for help. You turn it off, realign the paper, and restart the manual's print run. The night has grown longer."],
  ["Master Disks", "The master-disk ritual begins. You record the final version, verify that it reads, and place a second copy somewhere safe. No experiments on this disk: every duplicate will come from it. For the first time, the game feels less like an improvisation and more like a finished release."],
  ["The Cover Art", "With paper, transfer lettering, and a printed proof, you assemble the game's cover. Its artwork must promise adventure even to someone who has never seen the program run. When you step back to judge the whole, you realize the project has found a face of its own—one that might survive even behind a shop window."],
  ["Mass Duplication", "The master floppy opens the hardest stage of publication: duplicating the release without spreading mismatched versions. The drive repeats its mechanical song, copy after copy, while you verify that each disk reads. It takes hours, but spares you the nightmare of selling a game that works only on your own machine."],
  ["Mixed-Up Boxes", "The shipment is almost ready when you spot a logistical nightmare: labels and boxes have been swapped. One adventure's cover accompanies another game's disk. You open the packages, spread everything over the desk, and check each set. Better to lose a night than send this little horror to the shops."],
  ["A Magazine Review", "A magazine receives your demonstration before launch and prints an encouraging review. The writer praises the responsive controls and clear instructions, though the commercial edition is still on its way. You carefully cut out the page. For the first time, someone outside the club is telling your game's story."],
  ["The Fatal Erratum", "During the final proofread, you find a key printed incorrectly in the manual. Anyone following those instructions would be trapped on the first screen—a fault on paper that could condemn months of code. You prepare an erratum, correct the proofs, and delay distribution before the error reaches the boxes."],
  ["Readers' Choice Award", "The magazine's voting results arrive by post: readers have named your demonstration among their contest favorites. Commercial publication is still ahead, but the recognition makes the room feel larger. You pin the clipping above the microcomputer, a reminder that persistence was worth it."],
  ["Your Name in the Catalog", "At last, the catalog arrives. Among covers, descriptions, and prices stands your game's title—and beside it, your name in print. You remember the cassette's hiss, the blue screen, stubborn bugs, and sleepless nights of BASIC. The fear of failure has receded. Your adventure may now begin in someone else's home."],
] as const;

export const atosEn = {
  1: { titulo: "Prologue · The Beginning", narrativa: "The cursor waits on the screen, motionless and patient. An open magazine, a notebook of scribbles, and a cassette recorder cover your desk. You are still learning to turn commands into motion. Every small victory must be tested and saved with care. Your first challenge is not to defeat a monster, but to make BASIC obey." },
  10: { titulo: "Act 2 · BBS", narrativa: casasEn[9][1] },
  20: { titulo: "Act 3 · DEBUG", narrativa: casasEn[19][1] },
  30: { titulo: "Act 4 · FINAL", narrativa: casasEn[29][1] },
} as const;

export const prologoEn = {
  kicker: "RETRO-GHOST-85 // PROLOGUE",
  rotulo: "START",
  titulo: "You are a developer in 1985",
  paragrafos: [
    "The monitor's glow cuts across your desk. Beside the keyboard, a BASIC magazine promises adventures built from numbered lines; the cassette recorder awaits its first attempt. For now, your great game exists only in a notebook. What comes next demands patience, curiosity, and a few sleepless nights.",
    "Every square on the board tells an episode of your journey: discoveries, friends, temperamental floppy disks, and bugs that haunt you at the worst possible moment. The die decides where you go. Progress points mark your victories and setbacks, but cannot prevent anyone from winning.",
    "Everyone starts on square 1. The first player to reach square 40 gets the game into the catalog. As you cross Act 2 (square 10), Act 3 (square 20), and Act 4 (square 30), the first to reach each milestone earns the right to preserve their story.",
  ],
} as const;

/** The source episodes and mechanics are always kept in Brazilian Portuguese.
 * Only the displayed localized view changes.
 */
export function localizarCasa(casa: Casa, idioma: Idioma): Casa {
  if (idioma === "pt-BR") return casa;
  const traducao = casasEn[casa.id - 1];
  if (!traducao) throw new Error(`Square ${casa.id} has no English translation`);
  const { projeto, movimento, jogadaExtra, perdeTurno } = casa.consequencia;
  const frases: string[] = [];
  if (casa.id === 1) frases.push("First inspiration · no effect");
  else {
    if (projeto !== undefined) frases.push(`${projeto > 0 ? "+" : ""}${projeto} progress`);
    if (movimento) frases.push(`${movimento > 0 ? "move forward" : "move back"} ${Math.abs(movimento)} ${Math.abs(movimento) === 1 ? "square" : "squares"}`);
    if (jogadaExtra) frases.push("roll again");
    if (perdeTurno) frases.push("lose 1 turn");
    if (casa.tipo === "final") frases.push("victory");
  }
  return { ...casa, titulo: traducao[0], narrativa: traducao[1], efeito: frases.join(" · ") };
}
export function localizarAto(casa: 1 | 10 | 20 | 30, idioma: Idioma) {
  return idioma === "pt-BR" ? atos[casa] : atosEn[casa];
}
export function textoTipo(tipo: Casa["tipo"], idioma: Idioma): string {
  if (idioma === "pt-BR") return tipo.toUpperCase();
  return ({ marco: "MILESTONE", evento: "EVENT", fatalidade: "SETBACK", escolha: "CHOICE", final: "FINALE" } as const)[tipo];
}
export function tituloTrofeu(chave: "act10"|"act20"|"act30"|"endgame", idioma: Idioma): string {
  if (idioma === "pt-BR") return ({act10:"Ato 2",act20:"Ato 3",act30:"Ato 4",endgame:"Endgame"} as const)[chave];
  return ({act10:"Act 2",act20:"Act 3",act30:"Act 4",endgame:"Endgame"} as const)[chave];
}
export function efeitoDeEntrada(efeito: string, casaDestino: number, idioma: Idioma): string {
  if (idioma === "pt-BR") return efeito;
  if (efeito === "Ponto de partida · sem efeito") return "Starting square · no effect";
  if (efeito === "Penalidade cumprida · sem rolar o dado") return "Penalty served · no die rolled";
  const casa = casas[casaDestino - 1];
  return casa && casa.efeito === efeito ? localizarCasa(casa, idioma).efeito : efeito;
}
