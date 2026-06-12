import { EVENT_NAME, type Lead } from "./types";

// Estado em memória da Fase 1/2. Some quando o servidor reinicia — é só para
// teste visual e de fluxo. Na Fase 3 isto é substituído pelo Supabase.

function daysAgo(days: number, hour = 12, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

let seq = 0;
function makeLead(
  name: string,
  whatsapp: string,
  ticketQuantity: number,
  days: number,
  hour: number,
  minute: number
): Lead {
  seq += 1;
  return {
    id: `lead-${String(seq).padStart(3, "0")}`,
    name,
    whatsapp,
    ticketQuantity,
    eventName: EVENT_NAME,
    createdAt: daysAgo(days, hour, minute),
  };
}

export const mockLeads: Lead[] = [
  makeLead("Mariana Oliveira", "(62) 99812-4471", 2, 13, 9, 12),
  makeLead("Lucas Henrique Costa", "(62) 99645-1180", 4, 13, 18, 47),
  makeLead("Beatriz Almeida", "(62) 98123-9904", 1, 12, 10, 5),
  makeLead("Rafael Souza", "(11) 99876-2231", 2, 12, 14, 33),
  makeLead("Camila Fernandes", "(62) 99410-7765", 3, 11, 8, 21),
  makeLead("Pedro Henrique Lima", "(62) 99233-5512", 2, 11, 20, 9),
  makeLead("Juliana Martins", "(64) 99887-2034", 1, 10, 11, 40),
  makeLead("Gabriel Rodrigues", "(62) 99655-8890", 4, 10, 16, 2),
  makeLead("Larissa Carvalho", "(62) 98344-1276", 2, 9, 9, 55),
  makeLead("Thiago Pereira", "(61) 99712-6648", 3, 9, 19, 30),
  makeLead("Ana Clara Ribeiro", "(62) 99500-4417", 1, 8, 10, 18),
  makeLead("Matheus Gomes", "(62) 99388-7723", 2, 8, 13, 44),
  makeLead("Isabela Nunes", "(62) 99277-3360", 2, 7, 8, 7),
  makeLead("Vinícius Barbosa", "(62) 99844-1129", 4, 7, 21, 15),
  makeLead("Fernanda Dias", "(64) 99166-5582", 1, 6, 12, 3),
  makeLead("João Vitor Santos", "(62) 99933-7041", 3, 6, 17, 52),
  makeLead("Letícia Cardoso", "(62) 98099-3318", 2, 5, 9, 26),
  makeLead("Bruno Teixeira", "(11) 99622-8814", 1, 5, 15, 38),
  makeLead("Amanda Rocha", "(62) 99455-2207", 2, 5, 20, 1),
  makeLead("Felipe Andrade", "(62) 99711-9963", 4, 4, 10, 49),
  makeLead("Carolina Mendes", "(62) 99288-4470", 2, 4, 14, 12),
  makeLead("Diego Araújo", "(63) 99540-1185", 1, 4, 18, 33),
  makeLead("Natália Freitas", "(62) 99877-6620", 3, 3, 9, 8),
  makeLead("Rodrigo Cunha", "(62) 99344-7751", 2, 3, 13, 27),
  makeLead("Sophia Moreira", "(62) 98455-9902", 1, 3, 19, 44),
  makeLead("Eduardo Pinto", "(62) 99622-3014", 2, 2, 10, 16),
  makeLead("Gabriela Lopes", "(64) 99188-7745", 4, 2, 15, 5),
  makeLead("Henrique Vieira", "(62) 99700-2238", 2, 2, 21, 39),
  makeLead("Marina Castro", "(62) 99511-8847", 1, 1, 9, 51),
  makeLead("Otávio Ramos", "(62) 99366-4120", 3, 1, 14, 22),
  makeLead("Yasmin Correia", "(62) 98277-6693", 2, 1, 18, 10),
  makeLead("Leonardo Farias", "(11) 99655-7782", 2, 0, 11, 3),
  makeLead("Vitória Cavalcanti", "(62) 99422-1159", 1, 0, 16, 48),
];

// Total de acessos simulado à landing (sempre > nº de inscrições).
export const mockState = {
  pageViews: 1247,
};
