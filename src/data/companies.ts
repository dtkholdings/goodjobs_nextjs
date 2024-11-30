// src/data/companies.ts

export interface Company {
  id: string
  name: string
  description: string
  // Add other relevant fields as needed
}

export const companies: Company[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    description: 'Leading provider of road runner traps.'
  },
  {
    id: '2',
    name: 'Globex Corporation',
    description: 'Innovative solutions for modern problems.'
  }
  // Add more companies as needed
]
