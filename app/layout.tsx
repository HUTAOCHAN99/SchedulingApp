import './globals.css'

export const metadata = {
  title: 'CPU Scheduling Simulator',
  description: 'Simulasi algoritma penjadwalan proses FIFO, SJF, Round Robin',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}