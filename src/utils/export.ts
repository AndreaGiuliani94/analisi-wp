import * as XLSX from "xlsx";
import type { Player } from "@/components/Interfaces/Player"; 
import type { Match } from "@/components/Interfaces/Match";

interface ExportOptions {
  match: Match;
  formatTime: (ms: number) => string;
  getAllShoots: (player: Player) => string;
  getExclutions: (player: Player) => string;
}

export function exportTeamsToExcel({
  match,
  formatTime,
  getAllShoots,
  getExclutions,
}: ExportOptions) {
  const mapPlayersToRows = (players: Player[]) =>
    players.map((player) => ({
      Numero: player.number,
      Nome: player.name,
      "In campo": formatTime(player.activeTime),
      "In panchina": formatTime(player.benchTime),
      Pari: `${player.shotsEven.filter(s => s.outcome.toUpperCase() === 'GOAL').length}/${player.shotsEven.length}`,
      Sup: `${player.shotsSup.filter(s => s.outcome.toUpperCase() === 'GOAL').length}/${player.shotsSup.length}`,
      Rigori: `${player.shotsPenalty.filter(s => s.outcome.toUpperCase() === 'GOAL').length}/${player.shotsPenalty.length}`,
      Totali: getAllShoots(player),
      Falli: getExclutions(player),
    }));

  const wb = XLSX.utils.book_new();

  const wsHome = XLSX.utils.json_to_sheet(mapPlayersToRows(match.homeTeam.players));
  const wsAway = XLSX.utils.json_to_sheet(mapPlayersToRows(match.awayTeam.players));

  // Auto-colonne larghe
  const setAutoColWidths = (ws: XLSX.WorkSheet, rows: any[]) => {
    ws["!cols"] = Object.keys(rows[0] || {}).map((key) => ({
      wch: key.length + 10,
    }));
  };

  setAutoColWidths(wsHome, match.homeTeam.players);
  setAutoColWidths(wsAway, match.awayTeam.players);

  XLSX.utils.book_append_sheet(wb, wsHome, match.homeTeam.name);
  XLSX.utils.book_append_sheet(wb, wsAway, match.awayTeam.name);

  XLSX.writeFile(wb, match.homeTeam.name + '_' + match.awayTeam.name + ".xlsx");
}
