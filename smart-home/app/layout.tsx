import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Home3D — 空間智慧控制',description:'直接在自己的 3D 空間中操作智慧家庭設備。Google Home 與 Matter 互動模擬原型。'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-Hant"><body>{children}</body></html>}
