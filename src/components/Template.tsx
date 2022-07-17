import React, { useState } from 'react'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Autocomplete from '@mui/material/Autocomplete'
import Typography from '@mui/material/Typography'
import ListItemText from '@mui/material/ListItemText'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Fab from '@mui/material/Fab'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Container from '@mui/material/Container'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { typeNameMap } from './fields'
import { openDialog } from './EnsureDialog'
import { CircularLoading } from './Loading'
import { GET_DATA } from '../api'

import { useQuery, useApolloClient, gql } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

interface FieldType {
  _id: string
  name: string
}

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />
const checkedIcon = <CheckBoxIcon fontSize='small' />

const data2 = [{ title: '字段a', _id: 'a' }, { title: '字段B', type: 'number', _id: 'b' }, { title: '字段C', type: 'image', _id: 'c' }]

const Template: React.FC = () => {
  const client = useApolloClient()
  const [addFieldOpen, setAddFieldOpen] = useState(false)
  const [fieldsData, setFieldsData] = useState<any[]>([])
  const [options, setOptions] = useState<readonly FieldType[]>([])
  const { enqueueSnackbar } = useSnackbar()
  const { id } = useParams<{ id: string }>()
  const { loading, error, data } = useQuery(gql`
    query ($id: String!) {
      template { get(id: $id) { payload } }
    }
  `, { variables: { id } })

  if (error) throw error
  if (loading) return <CircularLoading loading />

  const payload = data.template.get.payload

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>模板: 模板名</Typography>
      <Card sx={{ margin: '1rem auto', maxWidth: 500 }}>
        <List>
          {data2.map(it => (
            <ListItem
              key={it._id}
              secondaryAction={
                <IconButton edge='end' onClick={() => { /* TODO: 删除模板字段 */ }}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={<>{it.title} <Chip label={(typeNameMap as any)[it.type || 'text']} size='small' /></>}
              />
            </ListItem>
          ))}
        </List>
      </Card>
      <Dialog
        open={addFieldOpen}
        onClose={() => setAddFieldOpen(false)}
      >
        <DialogTitle>添加新字段</DialogTitle>
        <DialogContent>
          <DialogContentText>请选择需要添加的字段</DialogContentText>
          <Autocomplete
            multiple
            isOptionEqualToValue={(a: any, b: any) => a._id === b._id}
            getOptionLabel={(option: FieldType) => option.name}
            options={options}
            loading={!options.length}
            limitTags={10}
            disableCloseOnSelect
            style={{ minWidth: 300, marginTop: 8 }}
            renderOption={(props, option: FieldType, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.name}
              </li>
            )}
            value={fieldsData}
            onChange={(_, value) => setFieldsData(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label='请选择需要添加的字段'
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {options.length ? null : <CircularProgress color='inherit' size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddFieldOpen(false)
              // TODO: 添加字段信息
            }}
          >
            确定
          </Button>
        </DialogActions>
        <Button
          onClick={() => {
            client.mutate(
              id
                ? {
                    mutation: gql`
                    mutation(id: String!, $name: String!, $payload: JSON!) {
                      template { update(id: $id, name: $name, payload: $payload) }
                    }
                  `,
                    variables: { id, name: '模板名', payload: fieldsData }
                  }
                : {
                    mutation: gql`
                    mutation($name: String!, $payload: JSON!) {
                      template { add(name: $name, payload: $payload) }
                    }
                  `,
                    variables: { name: '模板名', payload: fieldsData }
                  }).then((it) => {
              if (it.errors) throw it.errors[0]
              enqueueSnackbar('添加成功', { variant: 'success' })
            }).catch(err => {
              enqueueSnackbar(err.message, { variant: 'error' })
            })
          }}
        >提交
        </Button>
      </Dialog>
      <Fab
        color='primary'
        aria-label='add'
        sx={{ position: 'fixed', bottom: 36, right: 36 }}
        onClick={() => setAddFieldOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Container>
  )
}

export default Template
