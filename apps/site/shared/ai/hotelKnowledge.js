export const hotelKnowledgeBase = [
  {
    id: 'history',
    title: 'Historia do hotel',
    content:
      'O Araguaia Palace Hotel nasceu ha 48 anos a partir de um Posto Texaco e se consolidou como referencia de hospedagem em Alto Araguaia - MT.',
    tags: ['historia', 'fundacao', 'origem', 'hotel'],
  },
  {
    id: 'structure',
    title: 'Estrutura e acomodacoes',
    content:
      'O hotel possui 76 suites modernas, com foco em conforto, praticidade e atendimento acolhedor para viagens de lazer e corporativas.',
    tags: ['quartos', 'suites', 'acomodacoes', 'estrutura'],
  },
  {
    id: 'location',
    title: 'Localizacao',
    content:
      'O hotel fica na Av. Carlos Hugueney, 233 - Centro, em Alto Araguaia - MT, com facil acesso a pontos importantes da cidade.',
    tags: ['endereco', 'localizacao', 'onde fica', 'centro'],
  },
  {
    id: 'services',
    title: 'Servicos inclusos',
    content:
      'Os principais servicos incluem cafe da manha incluso, Wi-Fi cortesia e estacionamento 24 horas.',
    tags: ['servicos', 'wifi', 'estacionamento', 'cafe da manha'],
  },
  {
    id: 'pet',
    title: 'Pet friendly',
    content:
      'O hotel aceita pets sob consulta previa com a recepcao, para validar disponibilidade e regras da hospedagem.',
    tags: ['pet', 'animais', 'cachorro', 'gato'],
  },
  {
    id: 'timings',
    title: 'Check-in e check-out',
    content:
      'O horario padrao de check-in e as 14:00 e o check-out e as 12:00.',
    tags: ['check-in', 'check-out', 'horario', 'entrada', 'saida'],
  },
  {
    id: 'tourism',
    title: 'Pontos turisticos proximos',
    content:
      'Entre os pontos proximos estao a Cachoeira do Salto, a 12 km, e o Encontro das Aguas, a 3.5 km do hotel.',
    tags: ['turismo', 'pontos turisticos', 'cachoeira', 'encontro das aguas'],
  },
  {
    id: 'contact',
    title: 'Contato',
    content:
      'O principal canal de contato e o WhatsApp (66) 9 9602-9294, usado como fallback e atendimento humano.',
    tags: ['contato', 'whatsapp', 'telefone', 'recepcao'],
  },
];

export function getKnowledgeContext(query = '') {
  const normalized = query.toLowerCase();
  const scored = hotelKnowledgeBase
    .map((entry) => {
      const haystack = `${entry.title} ${entry.content} ${entry.tags.join(' ')}`.toLowerCase();
      const score = entry.tags.reduce((total, tag) => total + (normalized.includes(tag) ? 3 : 0), 0)
        + normalized
            .split(/\s+/)
            .filter(Boolean)
            .reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);

      return { entry, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ entry }) => entry);

  return scored.length > 0 ? scored : hotelKnowledgeBase.slice(0, 3);
}
