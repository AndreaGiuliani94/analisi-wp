import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Player } from "@/components/Interfaces/Player"; 
import type { Match } from "@/components/Interfaces/Match";
import type { Event } from "@/components/Interfaces/Event";

interface ExportOptions {
  match: Match;
  formatTime: (ms: number) => string;
  getAllShoots: (player: Player) => string;
  getExclutions: (player: Player) => string;
}

export async function exportTeamsToExcel({
    match,
    formatTime,
    getExclutions,
}: ExportOptions) {
    
    const workbook = new ExcelJS.Workbook();

    // Funzione helper per analizzare gli errori dei tiri
    const formatShotErrors = (shots: any[]) => {
        if (!shots || shots.length === 0) return '-';
        
        const parati = shots.filter(s => s.outcome.toUpperCase() === 'PARATO').length;
        const fuori = shots.filter(s => ['FUORI', 'PALO'].includes(s.outcome.toUpperCase())).length;
        const stoppati = shots.filter(s => s.outcome.toUpperCase() === 'STOPPATO').length;

        const errors = [];
        if (parati > 0) errors.push(`${parati} Par`);
        if (fuori > 0) errors.push(`${fuori} Fuo`);
        if (stoppati > 0) errors.push(`${stoppati} Sto`);

        return errors.length > 0 ? errors.join(', ') : '-';
    };

    // Funzione helper per contare i gol
    const countGoals = (shots: any[]) => {
        return shots ? shots.filter(s => s.outcome.toUpperCase() === 'GOAL').length : 0;
    };

    // Funzione principale che genera un foglio per una singola squadra
    const createTeamSheet = (team: any, sheetName: string) => {
        const sheet = workbook.addWorksheet(sheetName);

        // 1. Definiamo le chiavi per la mappatura dei dati
        sheet.columns = [
            { key: 'numero', width: 6 },
            { key: 'nome', width: 25 },
            { key: 'tempoIn', width: 12 },
            { key: 'tempoOut', width: 12 },
            { key: 'pariGol', width: 8 },
            { key: 'pariTiri', width: 8 },
            { key: 'pariErr', width: 22 }, // Colonna larga per i dettagli
            { key: 'supGol', width: 8 },
            { key: 'supTiri', width: 8 },
            { key: 'supErr', width: 22 }, // Colonna larga per i dettagli
            { key: 'rigGol', width: 8 },
            { key: 'rigTiri', width: 8 },
            { key: 'totGol', width: 8 },
            { key: 'totTiri', width: 8 },
            { key: 'falli', width: 8 },
            { key: 'falliDettaglio', width: 30 },
        ];

        // 2. CREAZIONE DELLE INTESTAZIONI A DUE LIVELLI
        
        // Riga 1: Macro-Categorie (verranno unite)
        sheet.addRow([
            'Anagrafica', '', 
            'Minutaggio', '', 
            'A Uomini Pari', '', '', 
            'In Superiorità', '', '', 
            'Rigori', '', 
            'Tiri Totali', '', 
            'Disciplina', ''
        ]);
        
        // Uniamo le celle della prima riga per creare il "tetto"
        sheet.mergeCells('A1:B1'); // Anagrafica
        sheet.mergeCells('C1:D1'); // Minutaggio
        sheet.mergeCells('E1:G1'); // Uomini Pari
        sheet.mergeCells('H1:J1'); // Superiorità
        sheet.mergeCells('K1:L1'); // Rigori
        sheet.mergeCells('M1:N1'); // Tiri Totali
        sheet.mergeCells('O1:P1'); // Disciplina

        // Riga 2: Sotto-Colonne specifiche
        sheet.addRow([
            'N.', 'Giocatore', 
            'In Campo', 'In Panchina', 
            'Gol', 'Tiri', 'Errori (Par, Fuo, Sto)', 
            'Gol', 'Tiri', 'Errori (Par, Fuo, Sto)', 
            'Gol', 'Tiri', 
            'Gol', 'Tiri', 
            'Falli', 'Dettaglio Falli'
        ]);

        // 3. STILIZZAZIONE DELLE INTESTAZIONI
        const row1 = sheet.getRow(1);
        row1.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        row1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF172554' } }; // Blue-950
        row1.alignment = { horizontal: 'center', vertical: 'middle' };

        const row2 = sheet.getRow(2);
        row2.font = { bold: true, color: { argb: 'FF1E293B' } }; // Slate-800
        row2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; // Slate-200
        row2.alignment = { horizontal: 'center', vertical: 'middle' };

        // 4. INSERIMENTO DEI DATI
        const players = team.players || [];
        players.forEach((player: any) => {
            
            // Calcoli base
            const pariG = countGoals(player.shotsEven);
            const pariT = player.shotsEven?.length || 0;
            const supG = countGoals(player.shotsSup);
            const supT = player.shotsSup?.length || 0;
            const rigG = countGoals(player.shotsPenalty);
            const rigT = player.shotsPenalty?.length || 0;
            
            const totG = pariG + supG + rigG;
            const totT = pariT + supT + rigT;
            const falliCom = player.exclutions?.length || 0;

            // Inseriamo la riga usando il sistema chiave-valore di exceljs
            const row = sheet.addRow({
                numero: player.number,
                nome: player.name,
                tempoIn: formatTime(player.activeTime),
                tempoOut: formatTime(player.benchTime),
                pariGol: pariG,
                pariTiri: pariT,
                pariErr: formatShotErrors(player.shotsEven),
                supGol: supG,
                supTiri: supT,
                supErr: formatShotErrors(player.shotsSup),
                rigGol: rigG,
                rigTiri: rigT,
                totGol: totG,
                totTiri: totT,
                falli: falliCom,
                falliDettaglio: getExclutions(player) // Usiamo la tua funzione che mappa già in stringa!
            });

            // Centriamo tutto tranne il nome e i dettagli dei falli
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                if (colNumber !== 2 && colNumber !== 16) {
                    // Numeri centrati
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                } else if (colNumber === 16) {
                    // Colonna 16 (Dettaglio Falli): Allineato a sinistra, in alto e TESTO A CAPO
                    cell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
                } else if (colNumber === 2) {
                    // Colonna 2 (Nome): Solo allineato a sinistra
                    cell.alignment = { horizontal: 'left', vertical: 'middle' };
                }
            });
        });

        // 4. Auto-Fit Dinamico
        autoFitColumn(sheet);

        // Aggiungiamo i bordi per rendere chiara la separazione delle sezioni
        const columnBorders = ['B', 'D', 'G', 'J', 'L', 'N'];
        columnBorders.forEach(col => {
            sheet.getColumn(col).eachCell({ includeEmpty: true }, (cell) => {
                cell.border = { right: { style: 'thin', color: { argb: 'FFCBD5E1' } } };
            });
        });
    };

    // Creiamo i fogli per entrambe le squadre
    createTeamSheet(match.homeTeam, 'Casa - ' + match.homeTeam.name.substring(0, 20)); // Substring per evitare nomi fogli troppo lunghi
    createTeamSheet(match.awayTeam, 'Trasferta - ' + match.awayTeam.name.substring(0, 15));

    // Generazione del file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Pulizia del nome file
    const sanitize = (name: string) => name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${sanitize(match.homeTeam.name)}_${sanitize(match.awayTeam.name)}_squadre.xlsx`;

    saveAs(blob, fileName);
}

export async function exportEventsToExcel(events: Event[], match: Match) {
    // 1. Inizializzazione del foglio di lavoro
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Eventi');

    // 2. Definizione delle Colonne
    sheet.columns = [
        { header: 'Tempo', key: 'tempo' },
        { header: 'Minuto', key: 'minuto' },
        { header: 'Squadra', key: 'squadra' },
        { header: 'Giocatore', key: 'giocatore' },
        { header: 'Evento', key: 'evento' },
        { header: 'Punteggio', key: 'punteggio' }
    ];

    // STILE: Rendiamo l'intestazione bellissima (Grassetto, Testo Bianco, Sfondo Blu)
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Testo bianco
    headerRow.fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: 'FF172554' } // Colore blue-950 di Tailwind
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // 3. Mappatura Dati
    const rows = events.map((event) => {
        let punteggio = '';
        if (event.homeScore !== undefined && event.awayScore !== undefined) {
            punteggio = `${event.homeScore} - ${event.awayScore}`;
        }

        return {
            tempo: `${event.quarter}°`,
            minuto: event.time,
            squadra: event.team,
            giocatore: `${event.player.number}. ${event.player.name}`,
            evento: event.description,
            punteggio: punteggio
        };
    });

    // Inserimento righe
    if (rows.length > 0) {
        sheet.addRows(rows);
    } else {
        sheet.addRow({ tempo: 'Nessun evento registrato' });
    }

    // 4. Auto-Fit Dinamico
    autoFitColumn(sheet);

    // Centriamo i testi delle prime due colonne (Tempo e Minuto)
    sheet.getColumn('tempo').alignment = { horizontal: 'center' };
    sheet.getColumn('minuto').alignment = { horizontal: 'center' };

    // 5. Generazione e Download del file
    // writeBuffer() è asincrono, quindi abbiamo aggiunto 'async' alla dichiarazione della funzione
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Creiamo il file per il browser
    const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    // Pulizia nome file
    const sanitize = (name: string) => name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${sanitize(match.homeTeam.name)}_${sanitize(match.awayTeam.name)}_eventi.xlsx`;

    // Attiviamo il download
    saveAs(blob, fileName);
}

function autoFitColumn(sheet: ExcelJS.Worksheet) {
  sheet.columns.forEach((column) => {
    // Rassicuriamo TypeScript: procediamo solo se 'column' e 'eachCell' esistono
    if (column && column.eachCell) {
      let maxLength = 0;

      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });

      // Impostiamo la larghezza (minimo 10, padding di 2, massimo 60)
      column.width = Math.min(Math.max(maxLength + 2, 10), 60);
    }
  });
}