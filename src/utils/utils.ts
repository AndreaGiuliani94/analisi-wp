import type { Exclution } from "@/interfaces/Exclution";

export function getExclution (exclution: Exclution) {
    var str: string = '';
    str += exclution.quarter + 'T ' + exclution.time + ' ' + (exclution.type + ' ' + exclution.position);
    if(exclution.type !== 'EDCS') {
        str += ' ';
        str += exclution.ball ? 'Con palla' : 'Senza palla';
    }
    return str;
}