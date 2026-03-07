
export interface ServiceTool {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  limitUsed: number;
  limitTotal: number;
  isPremium: boolean;
  category: string;
  icon: string;
}

export type SearchMode = 'CPF' | 'TELEFONE' | 'NOME' | 'CNPJ' | 'CEP' | 'PLACA';

export interface SearchResult {
  title: string;
  data: Record<string, string>;
}
