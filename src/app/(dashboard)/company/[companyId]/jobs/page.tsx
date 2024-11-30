// src/app/(dashboard)/company/[companyId]/jobs/page.tsx

'use client'

// import '@/models' // This imports all models

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useSession } from 'next-auth/react'

interface Job {
  _id: string
  job_title: string
  job_description: string
  job_type: string
  job_location_type: string
  job_level: string
  gender: string
  job_closing_date: string
  job_post_type: string
  skills: { _id: string; name: string }[]
  job_post_status: string
  createdAt: string
  updatedAt: string
}

const JobsPage: React.FC = () => {
  const router = useRouter()
  const params = useParams()
  const { companyId } = params as { companyId: string }

  const { data: session, status } = useSession()

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchJobs()
    }
  }, [status, filterStatus, searchQuery])

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`/api/company/${companyId}/jobs`, {
        params: {
          status: filterStatus !== 'All' ? filterStatus : undefined,
          search: searchQuery || undefined
        }
      })
      setJobs(response.data.jobs)
      setLoading(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch jobs')
      setLoading(false)
    }
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    try {
      await axios.delete(`/api/company/${companyId}/jobs/${jobId}`)
      setJobs(jobs.filter(job => job._id !== jobId))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete job')
    }
  }

  const handleEdit = (jobId: string) => {
    router.push(`/company/${companyId}/jobs/${jobId}/edit`)
  }

  const handleCreate = () => {
    router.push(`/company/${companyId}/jobs/create`)
  }

  const columns: GridColDef[] = [
    { field: 'job_title', headerName: 'Job Title', flex: 1 },
    { field: 'job_type', headerName: 'Job Type', width: 150 },
    { field: 'job_post_type', headerName: 'Post Type', width: 150 },
    { field: 'job_post_status', headerName: 'Status', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton color='primary' onClick={() => handleEdit(params.row._id)}>
            <EditIcon />
          </IconButton>
          <IconButton color='error' onClick={() => handleDelete(params.row._id)}>
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
  ]

  return (
    <Container sx={{ mt: 5, mb: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h4'>Jobs</Typography>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleCreate}>
          Create Job
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id='filter-status-label'>Filter by Status</InputLabel>
          <Select
            labelId='filter-status-label'
            id='filter-status'
            value={filterStatus}
            label='Filter by Status'
            onChange={e => setFilterStatus(e.target.value)}
          >
            <MenuItem value='All'>All</MenuItem>
            <MenuItem value='Draft'>Draft</MenuItem>
            <MenuItem value='Live'>Live</MenuItem>
            <MenuItem value='Expired'>Expired</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label='Search Jobs'
          variant='outlined'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newView) => {
            if (newView !== null) setViewMode(newView)
          }}
          aria-label='View Mode'
        >
          <ToggleButton value='list' aria-label='List View'>
            List
          </ToggleButton>
          <ToggleButton value='grid' aria-label='Grid View'>
            Grid
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity='error'>{error}</Alert>}

      {/* Jobs List */}
      {!loading && !error && viewMode === 'list' && (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={jobs}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } }
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            // rowsPerPageOptions={[10, 20, 50]}
            getRowId={row => row._id}
            // disableSelectionOnClick
          />
        </Box>
      )}

      {/* Grid View */}
      {!loading && !error && viewMode === 'grid' && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {jobs.map(job => (
            <Box key={job._id} sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, width: '100%', maxWidth: 300 }}>
              <Typography variant='h6'>{job.job_title}</Typography>
              <Typography variant='body2'>{job.job_type}</Typography>
              <Typography variant='body2'>Post Type: {job.job_post_type}</Typography>
              <Typography variant='body2'>Status: {job.job_post_status}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <IconButton color='primary' onClick={() => handleEdit(job._id)}>
                  <EditIcon />
                </IconButton>
                <IconButton color='error' onClick={() => handleDelete(job._id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  )
}

export default JobsPage
