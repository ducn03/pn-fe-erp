export interface Company {
  id: number;
  code: string;
  name: string;
  taxCode: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  status: string;
}

export interface UpdateCompanyInput {
  name: string;
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
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
  permissionIds?: number[];
  permissionCodes?: string[];
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  module: string;
  description?: string;
  status: string;
}
