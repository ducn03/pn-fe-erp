export interface Company {
  id: number;
  code: string;
  name: string;
  taxCode: string;
  address: string;
  phone: string;
  email: string;
  status: string;
}

export interface Department {
  id: number;
  companyId: number;
  code: string;
  name: string;
  description: string;
  status: string;
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string;
  status: string;
}
