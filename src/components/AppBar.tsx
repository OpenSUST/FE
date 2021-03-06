import React, { useState, useMemo } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import Container from '@mui/material/Container'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import AdbIcon from '@mui/icons-material/Adb'
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark'
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'
import { useApolloClient } from '@apollo/client'
import { FavoriteType } from '../types'
import { isLogin, username, isAdmin, AUTH, LOGOUT } from '../api'

const ResponsiveAppBar = () => {
  const navigate = useNavigate()
  const client = useApolloClient()
  const [open, setOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
  const loginData = useMemo(() => ({ username: '', password: '' }), [open])
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement>()
  const [favorites, setFavorites] = useState<Record<string, FavoriteType>>({})
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  return (
    <AppBar position='fixed'>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant='h6'
            noWrap
            component='a'
            href='/'
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            LOGO
          </Typography>
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant='h5'
            noWrap
            component='a'
            href='/'
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            LOGO
          </Typography>

          <Box sx={{ flexGrow: 0, ml: 'auto' }}>
            <Tooltip title='??????????????????'>
              <IconButton
                size='large'
                color='inherit'
                sx={{ mr: 1 }}
                onClick={e => {
                  setFavorites(JSON.parse(localStorage.getItem('favorites') || '{}'))
                  setAnchorEl(e.currentTarget)
                }}
              >
                <CollectionsBookmarkIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={isLogin ? '????????????' : '??????'}>
              <IconButton
                onClick={e => {
                  if (isLogin) setAnchorElUser(e.currentTarget)
                  else setOpen(true)
                }}
                sx={{ p: 0 }}
              >
                <Avatar alt={username}>{isLogin ? username : undefined}</Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              open={!!anchorElUser}
              onClose={() => setAnchorElUser(null)}
            >
              {isAdmin && (
                <MenuItem
                  onClick={() => {
                    setAnchorElUser(null)
                    navigate('/users')
                  }}
                >
                  <Typography textAlign='center'>????????????</Typography>
                </MenuItem>
              )}
              {isAdmin && (
                <MenuItem
                  onClick={() => {
                    setAnchorElUser(null)
                    navigate('/templates')
                  }}
                >
                  <Typography textAlign='center'>????????????</Typography>
                </MenuItem>
              )}
              {isAdmin && (
                <MenuItem
                  onClick={() => {
                    setAnchorElUser(null)
                    navigate('/schemas')
                  }}
                >
                  <Typography textAlign='center'>????????????</Typography>
                </MenuItem>
              )}
              {isAdmin && (
                <MenuItem
                  onClick={() => {
                    setAnchorElUser(null)
                    navigate('/create')
                  }}
                >
                  <Typography textAlign='center'>???????????????</Typography>
                </MenuItem>
              )}
              <MenuItem
                onClick={() => {
                  setAnchorElUser(null)
                  client.query({ query: LOGOUT }).catch(console.error).then(() => {
                    localStorage.removeItem('token')
                    localStorage.removeItem('username')
                    localStorage.removeItem('isAdmin')
                    enqueueSnackbar('????????????!', { variant: 'success' })
                    setTimeout(() => location.reload(), 500)
                  })
                }}
              >
                <Typography textAlign='center'>????????????</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(undefined)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <List sx={{ minWidth: 240 }}>
          {Object.entries(favorites).map(([id, it], i) => (
            <React.Fragment key={id}>
              {i ? <Divider /> : undefined}
              <ListItem
                disablePadding
                alignItems='flex-start'
                secondaryAction={
                  <Checkbox
                    edge='start'
                    checked={selectedItems[0] === id || selectedItems[1] === id}
                    tabIndex={-1}
                    onChange={e => setSelectedItems(e.target.checked
                      ? [selectedItems[1], id]
                      : selectedItems[0] === id ? [selectedItems[1]] : [selectedItems[0]])}
                  />
                }
              >
                <ListItemButton onClick={() => navigate('/item/' + id)}>
                  <ListItemAvatar>
                    <Avatar alt={it.title} src={it.image}>{it.image ? undefined : it.title[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={it.title} secondary={it.description} />
                </ListItemButton>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
        <Box sx={{ textAlign: 'right' }}>
          <Button
            disabled={!(selectedItems[0] && selectedItems[1])}
            onClick={() => navigate(`/compare/${selectedItems[0]}/${selectedItems[1]}`)}
          >
            ??????
          </Button>
        </Box>
      </Menu>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>??????</DialogTitle>
        <DialogContent>
          <DialogContentText>???????????????????????????????????????????????????</DialogContentText>
          <TextField
            autoFocus
            fullWidth
            margin='dense'
            variant='standard'
            label='?????????'
            onChange={e => (loginData.username = e.target.value)}
          />
          <TextField
            autoFocus
            fullWidth
            margin='dense'
            variant='standard'
            label='??????'
            type='password'
            onChange={e => (loginData.password = e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>??????</Button>
          <Button
            onClick={() => {
              setOpen(false)
              client.query({ query: AUTH, variables: loginData }).then(it => {
                if (it.error) throw it.error
                if (!it.data.user.auth) throw new Error('?????????????????????!')
                enqueueSnackbar('????????????!', { variant: 'success' })
                const { token, username, roles } = it.data.user.auth
                localStorage.setItem('token', token)
                localStorage.setItem('username', username)
                localStorage.setItem('isAdmin', roles.includes('ADMIN'))
                setTimeout(() => location.reload(), 500)
              }).catch(e => {
                console.error(e)
                enqueueSnackbar('????????????, ????????????????????????????????????.', { variant: 'error' })
              })
            }}
          >
            ??????
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  )
}
export default ResponsiveAppBar
