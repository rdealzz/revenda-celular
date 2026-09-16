export type ExpenseKind = 'deslocamento' | 'manutencao' | 'outros'

const TRAVEL = [
  'combust', 'gasolina', 'etanol', 'alcool', 'álcool', 'uber', '99', 'taxi', 'táxi',
  'pedagio', 'pedágio', 'onibus', 'ônibus', 'passagem', 'correio', 'frete', 'entrega',
  'motoboy', 'estacionamento', 'deslocamento', 'viagem', 'transporte',
]

const MAINTENANCE = [
  'pelicula', 'película', 'capinha', 'case', 'bateria', 'tela', 'display', 'conector',
  'limpeza', 'manuten', 'reparo', 'conserto', 'placa', 'camera', 'câmera', 'tampa',
  'carcaça', 'carcaca', 'alto-falante', 'microfone', 'flex', 'carregador', 'cabo',
]

const matches = (text: string, terms: string[]) => terms.some((term) => text.includes(term))

export function classifyExpense(description: string): ExpenseKind {
  const text = description.toLowerCase().trim()
  if (!text) return 'outros'
  if (matches(text, TRAVEL)) return 'deslocamento'
  if (matches(text, MAINTENANCE)) return 'manutencao'
  return 'outros'
}

export const EXPENSE_SUGGESTIONS = [
  'Combustível',
  'Uber',
  'Pedágio',
  'Correios',
  'Película',
  'Capinha',
  'Troca de bateria',
  'Tela',
  'Conector de carga',
  'Limpeza',
  'Manutenção',
]
