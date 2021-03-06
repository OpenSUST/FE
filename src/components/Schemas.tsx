import React, { useRef, useState } from 'react'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Fab from '@mui/material/Fab'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Container from '@mui/material/Container'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { skipFieldsList } from '../api'
import { typeNameMap } from './fields'
import { CircularLoading } from './Loading'

import { useQuery, useApolloClient, gql } from '@apollo/client'
import Schema from 'schemastery'
import { useSnackbar } from 'notistack'
import CreateFieldPopup from './CreateFieldPopup'

const getTypeName = (type: string) => {
  const schema = new Schema(JSON.parse(type))
  if (schema.type === 'number') return typeNameMap.number
  return (typeNameMap as any)[schema.meta!.kind!] as string
}

const Schemas: React.FC = () => {
  const client = useApolloClient()
  const [editId, setEditId] = useState('')
  const [newName, setNewName] = useState('')
  const { enqueueSnackbar } = useSnackbar()
  const createFieldPopup = useRef<{ open(): void }>()

  const { loading, error, data } = useQuery(gql`query { key { get { _id localization schema } } }`)

  if (error) throw error
  if (loading) return <CircularLoading loading />
  const rows = data.key.get

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>????????????</Typography>
      <TableContainer component={Paper} sx={{ mt: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>?????????</TableCell>
              <TableCell align='right'>??????</TableCell>
              <TableCell align='right'>??????</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.filter((it: any) => !skipFieldsList[it._id]).map((row: any) => (
              <TableRow
                key={row._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component='th' scope='row'>{row.localization?.['zh-CN'] || row._id}</TableCell>
                <TableCell align='right'>{getTypeName(row.schema) || '??????'}</TableCell>
                <TableCell align='right'>
                  <IconButton edge='end' size='small' onClick={() => setEditId(row._id)}>
                    <EditIcon fontSize='small' />
                  </IconButton>
                  <IconButton
                    edge='end'
                    size='small'
                    onClick={() => {
                      client.mutate({
                        mutation: gql`
                          mutation ($key: String!) {
                            key { del(key: $key) }
                          }
                        `,
                        variables: { key: editId }
                      }).then(it => {
                        if (it.errors) throw it.errors
                        enqueueSnackbar('??????????????????!', { variant: 'success' })
                      }).catch(e => {
                        console.error(e)
                        enqueueSnackbar('??????????????????!', { variant: 'error' })
                      })
                    }}
                  >
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                </TableCell>
              </TableRow>)
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <CreateFieldPopup ref={createFieldPopup as any} />
      <Dialog open={!!editId} onClose={() => setEditId('')}>
        <DialogTitle>????????????</DialogTitle>
        <DialogContent>
          <DialogContentText>??????????????????????????????????????????</DialogContentText>
          <TextField
            autoFocus
            fullWidth
            margin='dense'
            variant='standard'
            label='?????????'
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setNewName('')
              setEditId('')
            }}
          >
            ??????
          </Button>
          <Button
            onClick={() => {
              setNewName('')
              setEditId('')
              client.mutate({
                mutation: gql`
                  mutation ($key: String!, $name: String!) {
                    key {
                      setLocalization(key: $key, lang: "zh-CN", value: $name)
                    }
                  }
                `,
                variables: { key: editId, name: newName }
              }).then(it => {
                if (it.errors) throw it.errors[0]
                enqueueSnackbar('??????????????????!', { variant: 'success' })
                setTimeout(() => window.location.reload(), 1000) // TODO
              }).catch(e => {
                console.error(e)
                enqueueSnackbar('??????????????????!', { variant: 'error' })
              })
            }}
          >
            ??????
          </Button>
        </DialogActions>
      </Dialog>
      <Fab
        color='primary'
        aria-label='add'
        sx={{ position: 'fixed', bottom: 36, right: 36 }}
        onClick={() => createFieldPopup.current!.open()}
      >
        <AddIcon />
      </Fab>
    </Container>
  )
}

export default Schemas
