import React, { useCallback, useMemo, useRef, useState } from 'react'
import Schema from 'schemastery'

import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Fab from '@mui/material/Fab'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Container from '@mui/material/Container'
import SaveIcon from '@mui/icons-material/Save'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import fields, { defaultValues, typeNameMap } from './fields'
import Field from './fields/Field'
import { CircularLoading } from './Loading'
import { GET_DATA, ADD_DATA, UPDATE_DATA, skipFieldsList, ADD_TEMPLATE } from '../api'

import { useQuery, useApolloClient, gql } from '@apollo/client'
import { useParams, useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'

const defaultValue = {
  image: [],
  number: 0
}

interface FieldType {
  localization: any
  schema: Schema
  __typename: string
  _id: string
}

interface TemplateType {
  _id: string
  name: string
  payload: string
}

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />
const checkedIcon = <CheckBoxIcon fontSize='small' />

const ItemCard: React.FC = () => {
  const navigate = useNavigate()
  const client = useApolloClient()
  const { enqueueSnackbar } = useSnackbar()
  const { id } = useParams<{ id?: string }>()
  const [addFieldOpen, setAddFieldOpen] = useState(false)
  const [importTempateOpen, setImportTempateOpen] = useState(false)
  const [saveTemplateName, setSaveTemplateName] = useState('')
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
  const [options, setOptions] = useState<readonly FieldType[]>([])
  const [templates, setTemplates] = useState<readonly TemplateType[]>([])
  const [fieldsData, setFieldsData] = useState<FieldType[]>([])
  const [newData, setNewData] = useState<any>({ })
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null)

  const formData = useRef<Record<string, any>>({})
  const pendingList = useRef<Record<string, (() => Promise<void>)>>({})
  const onSubmit = useCallback((key: string, fn: () => Promise<void>) => { pendingList.current[key] = fn }, [])

  const { loading, error, data } = useQuery(id
    ? GET_DATA
    : gql`query { key { get(ids: ["title", "images", "description"]) { _id localization schema } } }`, { variables: { id } })

  const [schema, others] = useMemo(() => {
    if (!data) return []
    if (id) {
      const rows = data.item.get
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...others } = rows.items[0]
      setNewData(others)
      return [new Schema(rows.schema), others]
    }
    const rows = data.key.get
    const others = Object.fromEntries(rows.filter((i: any) => i._id !== '_id')
      .map((row: any) => [row._id, (defaultValue as any)[(schema as any).dict[row._id]?.meta?.kind as any] || '']))
    setNewData(others)
    return [Schema.object(Object.fromEntries(rows.map((row: any) => [row._id, new Schema(JSON.parse(row.schema))]))), others]
  }, [data])

  if (error) throw error
  if (loading) return <CircularLoading loading />

  const dumpState = () => JSON.stringify([])

  return (
    <Container sx={{ mt: 4 }} maxWidth='xl'>
      <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>{(newData as any).title || ''}</Typography>
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableBody>
          {Object.entries(newData).map(([key, value]) => {
            const EditorComponent = ((fields as any)[(schema as any).dict[key]?.meta?.kind as any] || fields.text).EditorComponent as Field<any>['EditorComponent']
            return (
              <TableRow key={key} sx={{ '& th': { width: 100 }, '& td': { pl: 0, textAlign: 'justify' } }}>
                <TableCell component='th' scope='row'>{key}</TableCell>
                <TableCell>
                  <EditorComponent
                    value={value}
                    name={key}
                    keyName={key}
                    data={formData.current}
                    onSubmit={onSubmit}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <Box sx={{ p: 1, textAlign: 'right' }}>
        <Button
          onClick={async () => {
            const res = await client.query({ query: gql`query { key { get { _id localization schema } } }` })
            const arr = res.data.key.get.filter((it: any) => !skipFieldsList[it._id])
            arr.forEach((it: any) => ({ ...it, schema: new Schema(JSON.stringify(it.schema)) }))
            setOptions(arr)
            setAddFieldOpen(true)
          }}
        >
          添加新字段
        </Button>
        <Button
          onClick={async () => {
            const res = await client.query({ query: gql`query { template { search { _id name payload } } }` })
            setTemplates(res.data.template.search)
            setImportTempateOpen(true)
          }}
        >
          导入模板
        </Button>
        <Button
          disabled
          onClick={async () => {
            setSaveTemplateOpen(true)
          }}
        >
          保存为模板
        </Button>
      </Box>
      <Fab
        color='primary'
        aria-label='save'
        sx={{ position: 'fixed', bottom: 36, right: 36 }}
        onClick={() => Promise.all(Object.values(pendingList.current))
          .then(() => client.mutate({ mutation: id ? UPDATE_DATA : ADD_DATA, variables: { id, set: formData.current } }))
          .then(it => {
            if (it.errors) throw it.errors
            enqueueSnackbar('保存成功!', { variant: 'success' })
            navigate('/item/' + (id || it.data.item.add))
          })
          .catch(e => {
            console.error(e)
            enqueueSnackbar('保存失败!', { variant: 'error' })
          })}
      >
        <SaveIcon />
      </Fab>
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
            getOptionLabel={(option: FieldType) => option.localization?.['zh-CN'] || option._id}
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
                {option.localization?.['zh-CN'] || option._id}&nbsp;<Chip label={(typeNameMap as any)[option.schema.meta?.kind || 'text']} size='small' />
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
              const obj: any = { title: newData.title, description: newData.description, images: newData.images }
              fieldsData.forEach(it => {
                const cur = (schema as any)[it._id] = it.schema
                obj[it._id] = (defaultValues as any)[cur.meta?.kind || 'text']()
              })
              for (const key in formData.current) {
                if (!(key in obj)) {
                  delete formData.current[key]
                  delete pendingList.current[key]
                }
              }
              for (const key in others) {
                if (!(key in obj)) {
                  formData.current[key] = null
                  delete pendingList.current[key]
                }
              }
              setNewData(obj)
            }}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={importTempateOpen}
        onClose={() => setImportTempateOpen(false)}
      >
        <DialogTitle>导入模板</DialogTitle>
        <DialogContent>
          <DialogContentText>请选择需要导入的模板</DialogContentText>
          <Autocomplete
            getOptionLabel={(option: TemplateType) => option.name}
            options={templates}
            loading={!templates.length}
            style={{ minWidth: 300, marginTop: 8 }}
            value={selectedTemplate}
            onChange={(_, value) => setSelectedTemplate(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label='请选择需要导入的模板'
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {templates.length ? null : <CircularProgress color='inherit' size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportTempateOpen(false)}>取消</Button>
          <Button
            onClick={() => {
              setImportTempateOpen(false)
              // TODO check overwrite field and prompt?
              loadState(selectedTemplate!.payload)
            }}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={saveTemplateOpen}
        onClose={() => setSaveTemplateOpen(false)}
      >
        <DialogTitle>保存为模板</DialogTitle>
        <DialogContent>
          <DialogContentText>请选择需要保存的模板</DialogContentText>
          <input type='text' value={saveTemplateName} onChange={(e) => setSaveTemplateName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveTemplateOpen(false)}>取消</Button>
          <Button
            onClick={() => {
              setSaveTemplateOpen(false)
              const state = dumpState() // returns json object
              client.mutate({ mutation: ADD_TEMPLATE, variables: { name: saveTemplateName, payload: state } })
            }}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ItemCard
