// src/app/(dashboard)/company/[companyId]/orders/page.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import { Container, Typography, CircularProgress, Alert, Box, TextField, MenuItem } from '@mui/material'
import { DataGrid, GridColDef, GridRowsProp, GridPaginationModel, GridToolbar } from '@mui/x-data-grid'

interface Order {
  id: string
  subscriptionPlan: string
  amount: number
  currency: string
  status: string
  payhereTransactionId?: string
  payhereOrderId?: string
  credits: number
  aiCredits: number
  createdAt: string
}

interface PaginatedOrdersResponse {
  orders: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const OrdersPage: React.FC = () => {
  const router = useRouter()
  const params = useParams()
  const companyId = params.companyId as string | undefined

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    if (companyId) {
      const fetchOrders = async () => {
        setLoading(true)
        setError(null)
        try {
          const response = await axios.get<PaginatedOrdersResponse>(`/api/company/${companyId}/orders`, {
            params: { page, limit }
          })

          setOrders(response.data.orders)
          setTotal(response.data.total)
          setLoading(false)
        } catch (err: any) {
          console.error('Error fetching orders:', err)
          setError(err.response?.data?.message || 'Failed to load orders.')
          setLoading(false)
        }
      }

      fetchOrders()
    }
  }, [companyId, page, limit])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize)
    setPage(1) // Reset to first page when page size changes
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Order ID', width: 220 },
    { field: 'subscriptionPlan', headerName: 'Subscription Plan', width: 200 },
    { field: 'amount', headerName: 'Amount', width: 100, type: 'number' },
    { field: 'currency', headerName: 'Currency', width: 100 },
    { field: 'status', headerName: 'Status', width: 130 },
    { field: 'payhereTransactionId', headerName: 'Transaction ID', width: 220 },
    { field: 'payhereOrderId', headerName: 'PayHere Order ID', width: 220 },
    { field: 'credits', headerName: 'Credits', width: 100, type: 'number' },
    { field: 'aiCredits', headerName: 'AI Credits', width: 120, type: 'number' },
    { field: 'createdAt', headerName: 'Created At', width: 180 }
  ]

  const rows: GridRowsProp = orders.map(order => ({
    id: order.id,
    subscriptionPlan: order.subscriptionPlan,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    payhereTransactionId: order.payhereTransactionId || 'N/A',
    payhereOrderId: order.payhereOrderId || 'N/A',
    credits: order.credits,
    aiCredits: order.aiCredits,
    createdAt: new Date(order.createdAt).toLocaleString()
  }))

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant='h4' gutterBottom>
        Order History
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity='error'>{error}</Alert>
      ) : (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            slots={{ toolbar: GridToolbar }}
            pageSizeOptions={[5, 10, 20, 50]}
            paginationModel={{ page: page - 1, pageSize: limit }}
            rowCount={total}
            paginationMode='server'
            onPaginationModelChange={(model: GridPaginationModel) => {
              setPage(model.page + 1)
              setLimit(model.pageSize)
            }}
            disableRowSelectionOnClick
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 }
              }
            }}
          />
        </Box>
      )}
    </Container>
  )
}

export default OrdersPage
