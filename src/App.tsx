import React from 'react'
import AppBar from './components/AppBar'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Item from './components/Item'
import Update from './components/Update'
import { SnackbarProvider } from 'notistack'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

// const data2 = {
//   name: '彩绘骆驼',
//   description: '一个简单的陶器，一个简单的陶器，一个简单的陶器，一个简单的陶器，一个简单的陶器，一个简单的陶器，一个简单的陶器，一个简单的陶器，一个简单的陶器，一个简单的陶器，一个简单的陶器',
//   image: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=164&h=164&fit=crop&auto=format&dpr=2',
//   category: '瓷器',
//   考古信息: { type: 'Text', value: '1978 年在陕西陇县神泉村出土的唐代彩绘骆驼' },
//   保存信息: { type: 'Text', value: '保存在陇县博物馆库房。彩绘骆驼脖子位置处有一圈白色装饰层，头部以及背部覆盖厚厚一层尘土，出现描绘和装饰的灰黑色物质以及少量的红色颜料层，腹部的白色打底层上有道黑色弧线，胎体疏松多孔，粉状颗粒物不断脱落；彩绘陶马表面颜料层完全脱落、整体支撑强度较低，现已无法站立。实验采集红色、白色和黑色颜料以及样品胎体呈层状或颗粒状粉化剥落物进行性能分析。' },
//   资料图片: { type: 'Image', value: ['https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=164&h=164&fit=crop&auto=format&dpr=2', 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=164&h=164&fit=crop&auto=format&dpr=2', 'https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=242&h=121&fit=crop&auto=format&dpr=2', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=242&h=242&fit=crop&auto=format&dpr=2'] },
//   一个表格: { type: 'LiveOffice', value: 'http://switch.apisium.cn/333.xlsx' },
//   CSV数据: {
//     type: 'CSV',
//     value: `样品名,Na+,K+,Mg2+,Ca2+,Cl-,SO42-,NO3-
// GD-2,0,0.3937,252.5551,13.9533,0.6163,0,1.6575`
//   }
// }

function App () {
  return (
    <>
      <AppBar />
      <Toolbar />
      <SnackbarProvider maxSnack={5}>
        <Container sx={{ mt: 4 }} maxWidth='xl'>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<></>} />
              <Route path='item/:id' element={<Item />} />
              <Route path='update/:id' element={<Update />} />
            </Routes>
          </BrowserRouter>
        </Container>
      </SnackbarProvider>
    </>
  )
}

export default App
