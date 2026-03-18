
export enum MovementType {
  ENTRY = 'ENTRADA',
  EXIT = 'SAÍDA'
}

export interface Supplier {
  id: number;
  nome: string;
  contacto: string;
  email: string;
  endereco?: string;
}

export interface Medication {
  id: number;
  nome: string;
  categoria: string;
  quantidade: number;
  quantidade_minima: number;
  lote: string;
  data_validade: string;
  fornecedor_id?: number;
  supplier_name?: string;
  preco_venda: number;
}

export interface Movement {
  id: number;
  medicamento_id: number;
  medication_name: string;
  tipo: MovementType;
  quantidade: number;
  data_movimento: string;
  referencia: string;
  operator_name: string;
}

export interface User {
  id: number;
  username: string;
  nome_completo: string;
  role: 'ADMIN' | 'OPERADOR';
}
